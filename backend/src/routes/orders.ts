import { Router, Request, Response } from "express";
import { db } from "../db/pool";
import { authenticate } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";

export const orderRouter = Router();

// All order routes require auth
orderRouter.use(authenticate);

// POST /api/orders — create order
orderRouter.post("/", async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { items } = req.body as {
    items: Array<{ productId: string; quantity: number }>;
  };

  if (!items?.length) return res.status(400).json({ message: "No items" });

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    let total = 0;
    const enriched: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }> = [];

    for (const item of items) {
      // Lock row to prevent overselling
      const { rows } = await client.query(
        "SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE",
        [item.productId]
      );
      const product = rows[0];
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity)
        throw new Error(`Insufficient stock for ${product.name}`);

      // Deduct stock
      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [item.quantity, item.productId]
      );

      total += product.price * item.quantity;
      enriched.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const orderId = uuidv4();
    await client.query(
      `INSERT INTO orders (id, user_id, total, status) VALUES ($1,$2,$3,'pending')`,
      [orderId, userId, total]
    );

    for (const item of enriched) {
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [uuidv4(), orderId, item.productId, item.productName, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      id: orderId,
      userId,
      items: enriched,
      total,
      status: "pending",
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    return res.status(400).json({ message: err.message || "Order failed" });
  } finally {
    client.release();
  }
});

// GET /api/orders — my orders
orderRouter.get("/", async (req: Request, res: Response) => {
  try {
    const orders = await db.query(
      `SELECT o.id, o.total, o.status, o.created_at AS "createdAt",
              json_agg(json_build_object(
                'productId', oi.product_id,
                'productName', oi.product_name,
                'quantity', oi.quantity,
                'price', oi.price
              )) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user!.userId]
    );
    return res.json(orders.rows);
  } catch {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
});
