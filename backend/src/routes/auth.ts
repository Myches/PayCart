import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { db } from "../db/pool";
import { generateToken } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";

export const authRouter = Router();

// POST /api/auth/register
authRouter.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Min 8 characters"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      const existing = await db.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      if (existing.rows.length > 0)
        return res.status(409).json({ message: "Email already registered" });

      const hash = await bcrypt.hash(password, 12);
      const id = uuidv4();

      await db.query(
        "INSERT INTO users (id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,$5)",
        [id, name, email, hash, "customer"]
      );

      const token = generateToken({ userId: id, email, role: "customer" });
      return res.status(201).json({ token, user: { id, name, email, role: "customer" } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Registration failed" });
    }
  }
);

// POST /api/auth/login
authRouter.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const result = await db.query(
        "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
        [email]
      );
      const user = result.rows[0];
      if (!user || !(await bcrypt.compare(password, user.password_hash)))
        return res.status(401).json({ message: "Invalid credentials" });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Login failed" });
    }
  }
);
