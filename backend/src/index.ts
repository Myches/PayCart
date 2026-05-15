import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import serverless from "serverless-http";

import { productRouter } from "./routes/products";
import { orderRouter } from "./routes/orders";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app = express();

// ── Trust proxy ───────────────────────────────────────────
// Required on Lambda/API Gateway — they add X-Forwarded-For headers
// Without this express-rate-limit throws a ValidationError
app.set("trust proxy", 1);

// ── Security ──────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Rate limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ── Body parsing & logging ────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Health check ──────────────────────────────────────────
// Handles both /api/health (local) and /prod/api/health (API Gateway)
app.get(["/api/health", "/prod/api/health"], (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes — support both local and API Gateway stage prefix ──
app.use(["/api/auth",    "/prod/api/auth"],    authRouter);
app.use(["/api/products","/prod/api/products"],productRouter);
app.use(["/api/orders",  "/prod/api/orders"],  orderRouter);
app.use(["/api/admin",   "/prod/api/admin"],   adminRouter);

// ── Error handling ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Local dev server ──────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 PayCart API running at http://localhost:${PORT}`);
  });
}

// ── Lambda / serverless-http export ──────────────────────
export const handler = serverless(app);
export default app;