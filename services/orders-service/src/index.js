import express from "express";
import morgan from "morgan";
import fetch from "node-fetch";
import { nanoid } from "nanoid";
import { PrismaClient } from "@prisma/client";
import { createChannel } from "./amqp.js";
import events from "../../../common/events.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import cors from "cors";

const prisma = new PrismaClient();
const { ROUTING_KEYS } = events;

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:3000" }));

const PORT = process.env.PORT || 3002;
const USERS_BASE_URL = process.env.USERS_BASE_URL || "http://localhost:3001";
const HTTP_TIMEOUT_MS = Number(process.env.HTTP_TIMEOUT_MS || 2000);
const RABBITMQ_URL =
  process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const EXCHANGE = process.env.EXCHANGE || "app.topic";
const QUEUE = process.env.QUEUE || "orders.q";
const ROUTING_KEY_USER_CREATED =
  process.env.ROUTING_KEY_USER_CREATED || ROUTING_KEYS.USER_CREATED;

// In-memory cache de usuários (preenchido por eventos)
const userCache = new Map();

app.get("/docs.json", (req, res) => res.json(swaggerSpec));
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

let amqp = null;
(async () => {
  try {
    amqp = await createChannel(RABBITMQ_URL, EXCHANGE);
    console.log("[orders] AMQP connected");

    // Bind de fila para consumir eventos user.created
    await amqp.ch.assertQueue(QUEUE, { durable: true });
    await amqp.ch.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY_USER_CREATED);

    amqp.ch.consume(QUEUE, (msg) => {
      if (!msg) return;
      try {
        const user = JSON.parse(msg.content.toString());
        // idempotência simples: atualiza/define
        userCache.set(user.id, user);
        console.log("[orders] consumed event user.created -> cached", user.id);
        amqp.ch.ack(msg);
      } catch (err) {
        console.error("[orders] consume error:", err.message);
        amqp.ch.nack(msg, false, false); // descarta em caso de erro de parsing (aula: discutir DLQ)
      }
    });
  } catch (err) {
    console.error("[orders] AMQP connection failed:", err.message);
  }
})();

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: "orders", db: "ok" });
  } catch (e) {
    res.status(503).json({ ok: false, service: "orders", db: "down" });
  }
});

app.get("/", async (req, res) => {
  try {
    const list = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  } catch (e) {
    console.error("[orders] list error:", e.message);
    res.status(500).json({ error: "internal" });
  }
});

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

app.post("/", async (req, res) => {
  const { userId, items, total } = req.body || {};
  if (!userId || !Array.isArray(items) || typeof total !== "number") {
    return res
      .status(400)
      .json({ error: "userId, items[], total<number> são obrigatórios" });
  }

  // 1) Validação síncrona (HTTP) no Users Service
  try {
    const resp = await fetchWithTimeout(
      `${USERS_BASE_URL}/${userId}`,
      HTTP_TIMEOUT_MS
    );
    if (!resp.ok) return res.status(400).json({ error: "usuário inválido" });
  } catch (err) {
    console.warn(
      "[orders] users-service timeout/failure, tentando cache...",
      err.message
    );
    // fallback: usar cache populado por eventos (assíncrono)
    if (!userCache.has(userId)) {
      return res.status(503).json({
        error: "users-service indisponível e usuário não encontrado no cache",
      });
    }
  }

  const id = `o_${nanoid(6)}`;
  const order = {
    id,
    userId,
    items,
    total,
    status: "created",
    createdAt: new Date(),
  };

  try {
    const created = await prisma.order.create({ data: order });

    // (Opcional) publicar evento order.created
    try {
      if (amqp?.ch) {
        amqp.ch.publish(
          EXCHANGE,
          ROUTING_KEYS.ORDER_CREATED,
          Buffer.from(JSON.stringify(created)),
          { persistent: true }
        );
        console.log(
          "[orders] published event:",
          ROUTING_KEYS.ORDER_CREATED,
          created.id
        );
      }
    } catch (err) {
      console.error("[orders] publish error:", err.message);
    }

    res.status(201).json(created);
  } catch (e) {
    console.error("[orders] create error:", e.message);
    res.status(500).json({ error: "internal" });
  }
});

app.listen(PORT, () => {
  console.log(`[orders] listening on http://localhost:${PORT}`);
  console.log(`[orders] users base url: ${USERS_BASE_URL}`);
  console.log(`[orders] swagger -> http://localhost:${PORT}/docs`);
});

process.on("SIGINT", async () => {
  try {
    await prisma.$disconnect();
  } catch {}
  process.exit(0);
});
process.on("SIGTERM", async () => {
  try {
    await prisma.$disconnect();
  } catch {}
  process.exit(0);
});
