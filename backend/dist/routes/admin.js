"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.use(auth_1.authenticate, auth_1.requireAdmin);
// GET /api/admin/dashboard — summary stats
exports.adminRouter.get("/dashboard", async (_req, res) => {
    try {
        const [orders, revenue, users, products] = await Promise.all([
            pool_1.db.query("SELECT COUNT(*) AS count FROM orders"),
            pool_1.db.query("SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE status != 'cancelled'"),
            pool_1.db.query("SELECT COUNT(*) AS count FROM users"),
            pool_1.db.query("SELECT COUNT(*) AS count FROM products"),
        ]);
        return res.json({
            totalOrders: Number(orders.rows[0].count),
            totalRevenue: Number(revenue.rows[0].total),
            totalUsers: Number(users.rows[0].count),
            totalProducts: Number(products.rows[0].count),
        });
    }
    catch {
        return res.status(500).json({ message: "Dashboard fetch failed" });
    }
});
// GET /api/admin/orders — all orders
exports.adminRouter.get("/orders", async (_req, res) => {
    try {
        const result = await pool_1.db.query(`SELECT o.id, o.total, o.status, o.created_at AS "createdAt",
              u.name AS "userName", u.email AS "userEmail"
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT 100`);
        return res.json(result.rows);
    }
    catch {
        return res.status(500).json({ message: "Failed to fetch orders" });
    }
});
// PATCH /api/admin/orders/:id/status
exports.adminRouter.patch("/orders/:id/status", async (req, res) => {
    const { status } = req.body;
    const valid = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!valid.includes(status))
        return res.status(400).json({ message: "Invalid status" });
    try {
        const result = await pool_1.db.query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
        if (!result.rows[0])
            return res.status(404).json({ message: "Order not found" });
        return res.json(result.rows[0]);
    }
    catch {
        return res.status(500).json({ message: "Status update failed" });
    }
});
//# sourceMappingURL=admin.js.map