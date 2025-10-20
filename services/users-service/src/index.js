import express from "express";
import morgan from "morgan";
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

const PORT = process.env.PORT || 3001;
const RABBITMQ_URL =
  process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const EXCHANGE = process.env.EXCHANGE || "app.topic";

let amqp = null;
(async () => {
  try {
    amqp = await createChannel(RABBITMQ_URL, EXCHANGE);
    console.log("[users] AMQP connected");
  } catch (err) {
    console.error("[users] AMQP connection failed:", err.message);
  }
})();

// Swagger endpoints
app.get("/docs.json", (req, res) => res.json(swaggerSpec));
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.get("/health", async (req, res) => {
  try {
    // ping simples: consulta mínima
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: "users", db: "ok" });
  } catch (e) {
    res.status(503).json({ ok: false, service: "users", db: "down" });
  }
});

app.get("/", async (req, res) => {
  try {
    const list = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    res.json(list);
  } catch (e) {
    console.error("[users] list error:", e.message);
    res.status(500).json({ error: "internal" });
  }
});

app.post("/", async (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email)
    return res.status(400).json({ error: "name and email are required" });

  const id = `u_${nanoid(6)}`;
  try {
    const user = await prisma.user.create({
      data: { id, name, email },
    });

    // Publish event
    try {
      if (amqp?.ch) {
        const payload = Buffer.from(JSON.stringify(user));
        amqp.ch.publish(EXCHANGE, ROUTING_KEYS.USER_CREATED, payload, {
          persistent: true,
        });
        console.log(
          "[users] published event:",
          ROUTING_KEYS.USER_CREATED,
          user
        );
      }
    } catch (err) {
      console.error("[users] publish error:", err.message);
    }

    res.status(201).json(user);
  } catch (e) {
    if (e.code === "P2002") {
      return res.status(400).json({ error: "email already exists" });
    }
    console.error("[users] create error:", e.message);
    res.status(500).json({ error: "internal" });
  }
});

app.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "not found" });
    res.json(user);
  } catch (e) {
    console.error("[users] get error:", e.message);
    res.status(500).json({ error: "internal" });
  }
});

app.listen(PORT, () => {
  console.log(`[users] listening on http://localhost:${PORT}`);
  console.log(`[users] swagger -> http://localhost:${PORT}/docs`);
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
