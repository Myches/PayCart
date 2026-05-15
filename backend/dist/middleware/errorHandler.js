"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFound = notFound;
function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal server error"
        : err.message;
    console.error(`[ERROR] ${statusCode} — ${err.message}`, err.stack);
    res.status(statusCode).json({
        error: { message, code: err.code },
    });
}
function notFound(_req, res) {
    res.status(404).json({ error: { message: "Route not found" } });
}
//# sourceMappingURL=errorHandler.js.map