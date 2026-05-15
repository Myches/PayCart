"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const products_1 = require("./routes/products");
const orders_1 = require("./routes/orders");
const auth_1 = require("./routes/auth");
const admin_1 = require("./routes/admin");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const app = (0, express_1.default)();
// ── Trust proxy ───────────────────────────────────────────
// Required on Lambda/API Gateway — they add X-Forwarded-For headers
// Without this express-rate-limit throws a ValidationError
app.set("trust proxy", 1);
// ── Security ──────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// ── Rate limiting ─────────────────────────────────────────
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// ── Body parsing & logging ────────────────────────────────
app.use(express_1.default.json({ limit: "10kb" }));
app.use((0, morgan_1.default)(process.env.NODE_ENV === "production" ? "combined" : "dev"));
// ── Health check ──────────────────────────────────────────
// Handles both /api/health (local) and /prod/api/health (API Gateway)
app.get(["/api/health", "/prod/api/health"], (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// ── Routes — support both local and API Gateway stage prefix ──
app.use(["/api/auth", "/prod/api/auth"], auth_1.authRouter);
app.use(["/api/products", "/prod/api/products"], products_1.productRouter);
app.use(["/api/orders", "/prod/api/orders"], orders_1.orderRouter);
app.use(["/api/admin", "/prod/api/admin"], admin_1.adminRouter);
// ── Error handling ────────────────────────────────────────
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
// ── Local dev server ──────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000;
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`🚀 PayCart API running at http://localhost:${PORT}`);
    });
}
// ── Lambda / serverless-http export ──────────────────────
exports.handler = (0, serverless_http_1.default)(app);
exports.default = app;
//# sourceMappingURL=index.js.map