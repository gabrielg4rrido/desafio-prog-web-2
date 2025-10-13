import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 3000;
const USERS_URL = process.env.USERS_URL || "http://localhost:3001";
const ORDERS_URL = process.env.ORDERS_URL || "http://localhost:3002";

app.get("/health", (req, res) => res.json({ ok: true, service: "gateway" }));
app.get("/docs/gateway.json", (req, res) => res.json(swaggerSpec));

app.use(
  "/docs/users.json",
  createProxyMiddleware({
    target: USERS_URL,
    changeOrigin: true,
    pathRewrite: () => "/docs.json",
  })
);

app.use(
  "/docs/orders.json",
  createProxyMiddleware({
    target: ORDERS_URL,
    changeOrigin: true,
    pathRewrite: () => "/docs.json",
  })
);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    explorer: true,
    swaggerOptions: {
      urls: [
        { url: "/docs/gateway.json", name: "gateway" },
        { url: "/docs/users.json", name: "users-service" },
        { url: "/docs/orders.json", name: "orders-service" },
      ],
    },
  })
);

// Roteamento de APIs
app.use(
  "/users",
  createProxyMiddleware({
    target: USERS_URL,
    changeOrigin: true,
    pathRewrite: { "^/users": "" },
  })
);

app.use(
  "/orders",
  createProxyMiddleware({
    target: ORDERS_URL,
    changeOrigin: true,
    pathRewrite: { "^/orders": "" },
  })
);

app.listen(PORT, () => {
  console.log(`[gateway] listening on http://localhost:${PORT}`);
  console.log(`[gateway] users -> ${USERS_URL}`);
  console.log(`[gateway] orders -> ${ORDERS_URL}`);
  console.log(`[gateway] swagger -> http://localhost:${PORT}/docs`);
});
