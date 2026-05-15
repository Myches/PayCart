"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
const uuid_1 = require("uuid");
exports.authRouter = (0, express_1.Router)();
// POST /api/auth/register
exports.authRouter.post("/register", [
    (0, express_validator_1.body)("name").trim().notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("password").isLength({ min: 8 }).withMessage("Min 8 characters"),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { name, email, password } = req.body;
    try {
        const existing = await pool_1.db.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0)
            return res.status(409).json({ message: "Email already registered" });
        const hash = await bcryptjs_1.default.hash(password, 12);
        const id = (0, uuid_1.v4)();
        await pool_1.db.query("INSERT INTO users (id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,$5)", [id, name, email, hash, "customer"]);
        const token = (0, auth_1.generateToken)({ userId: id, email, role: "customer" });
        return res.status(201).json({ token, user: { id, name, email, role: "customer" } });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Registration failed" });
    }
});
// POST /api/auth/login
exports.authRouter.post("/login", [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("password").notEmpty(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
        const result = await pool_1.db.query("SELECT id, name, email, password_hash, role FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user || !(await bcryptjs_1.default.compare(password, user.password_hash)))
            return res.status(401).json({ message: "Invalid credentials" });
        const token = (0, auth_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        return res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Login failed" });
    }
});
//# sourceMappingURL=auth.js.map