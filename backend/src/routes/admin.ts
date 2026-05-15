import { Router, Request, Response } from "express";
import { db } from "../db/pool";
import { authenticate, requireAdmin } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

// GET /api/admin/dashboard — summary stats
adminRouter.get("/dashboard", async (_req: Request, res: Response) => {
  try {
    const [orders, revenue, users, products] = await Promise.all([
      db.query("SELECT COUNT(*) AS count FROM orders"),
      db.query("SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE status != 'cancelled'"),
      db.query("SELECT COUNT(*) AS count FROM users"),
      db.query("SELECT COUNT(*) AS count FROM products"),
    ]);

    return res.json({
      totalOrders: Number(orders.rows[0].count),
      totalRevenue: Number(revenue.rows[0].total),
      totalUsers: Number(users.rows[0].count),
      totalProducts: Number(products.rows[0].count),
    });
  } catch {
    return res.status(500).json({ message: "Dashboard fetch failed" });
  }
});

// GET /api/admin/orders — all orders
adminRouter.get("/orders", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT o.id, o.total, o.status, o.created_at AS "createdAt",
              u.name AS "userName", u.email AS "userEmail"
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT 100`
    );
    return res.json(result.rows);
  } catch {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// PATCH /api/admin/orders/:id/status
adminRouter.patch("/orders/:id/status", async (req: Request, res: Response) => {
  const { status } = req.body;
  const valid = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!valid.includes(status))
    return res.status(400).json({ message: "Invalid status" });

  try {
    const result = await db.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: "Order not found" });
    return res.json(result.rows[0]);
  } catch {
    return res.status(500).json({ message: "Status update failed" });
  }
});
