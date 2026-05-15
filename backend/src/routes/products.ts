import { Router, Request, Response } from "express";
import { db } from "../db/pool";
import { authenticate, requireAdmin } from "../middleware/auth";
import { body, param, validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";

export const productRouter = Router();

// GET /api/products — public listing
productRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT id, name, description, price, stock, image_url AS "imageUrl", category, created_at AS "createdAt"
       FROM products
       WHERE stock > 0
       ORDER BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET /api/products/:id — single product
productRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT id, name, description, price, stock, image_url AS "imageUrl", category, created_at AS "createdAt"
       FROM products WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: "Not found" });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch product" });
  }
});

// POST /api/products — admin only
productRouter.post(
  "/",
  authenticate,
  requireAdmin,
  [
    body("name").trim().notEmpty(),
    body("price").isFloat({ min: 0 }),
    body("stock").isInt({ min: 0 }),
    body("category").trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description, price, stock, imageUrl, category } = req.body;
    try {
      const id = uuidv4();
      const result = await db.query(
        `INSERT INTO products (id, name, description, price, stock, image_url, category)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id, name, description, price, stock, image_url AS "imageUrl", category, created_at AS "createdAt"`,
        [id, name, description, price, stock, imageUrl || null, category]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ message: "Failed to create product" });
    }
  }
);

// PATCH /api/products/:id — admin only
productRouter.patch(
  "/:id",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const fields = req.body as Record<string, unknown>;
    const allowed = ["name", "description", "price", "stock", "image_url", "category"];
    const setClauses: string[] = [];
    const values: unknown[] = [];

    Object.entries(fields).forEach(([key, val]) => {
      if (allowed.includes(key)) {
        setClauses.push(`${key} = $${values.length + 1}`);
        values.push(val);
      }
    });

    if (setClauses.length === 0)
      return res.status(400).json({ message: "No valid fields to update" });

    values.push(req.params.id);
    try {
      const result = await db.query(
        `UPDATE products SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`,
        values
      );
      if (!result.rows[0]) return res.status(404).json({ message: "Not found" });
      return res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ message: "Update failed" });
    }
  }
);
