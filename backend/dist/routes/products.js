"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
exports.productRouter = (0, express_1.Router)();
// GET /api/products — public listing
exports.productRouter.get("/", async (_req, res) => {
    try {
        const result = await pool_1.db.query(`SELECT id, name, description, price, stock, image_url AS "imageUrl", category, created_at AS "createdAt"
       FROM products
       WHERE stock > 0
       ORDER BY created_at DESC`);
        return res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch products" });
    }
});
// GET /api/products/:id — single product
exports.productRouter.get("/:id", async (req, res) => {
    try {
        const result = await pool_1.db.query(`SELECT id, name, description, price, stock, image_url AS "imageUrl", category, created_at AS "createdAt"
       FROM products WHERE id = $1`, [req.params.id]);
        if (!result.rows[0])
            return res.status(404).json({ message: "Not found" });
        return res.json(result.rows[0]);
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to fetch product" });
    }
});
// POST /api/products — admin only
exports.productRouter.post("/", auth_1.authenticate, auth_1.requireAdmin, [
    (0, express_validator_1.body)("name").trim().notEmpty(),
    (0, express_validator_1.body)("price").isFloat({ min: 0 }),
    (0, express_validator_1.body)("stock").isInt({ min: 0 }),
    (0, express_validator_1.body)("category").trim().notEmpty(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { name, description, price, stock, imageUrl, category } = req.body;
    try {
        const id = (0, uuid_1.v4)();
        const result = await pool_1.db.query(`INSERT INTO products (id, name, description, price, stock, image_url, category)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id, name, description, price, stock, image_url AS "imageUrl", category, created_at AS "createdAt"`, [id, name, description, price, stock, imageUrl || null, category]);
        return res.status(201).json(result.rows[0]);
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to create product" });
    }
});
// PATCH /api/products/:id — admin only
exports.productRouter.patch("/:id", auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const fields = req.body;
    const allowed = ["name", "description", "price", "stock", "image_url", "category"];
    const setClauses = [];
    const values = [];
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
        const result = await pool_1.db.query(`UPDATE products SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`, values);
        if (!result.rows[0])
            return res.status(404).json({ message: "Not found" });
        return res.json(result.rows[0]);
    }
    catch (err) {
        return res.status(500).json({ message: "Update failed" });
    }
});
//# sourceMappingURL=products.js.map