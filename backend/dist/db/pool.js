"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
// AWS RDS Free Tier PostgreSQL connection
// On Lambda, pg will reuse the pool across warm invocations
const pool = new pg_1.Pool({
    host: process.env.DB_HOST, // RDS endpoint
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "paycart",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false } // RDS requires SSL
        : false,
    max: 5, // Keep low for Lambda concurrency
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
pool.on("error", (err) => {
    console.error("Unexpected DB pool error", err);
});
exports.db = {
    query: pool.query.bind(pool),
    pool,
};
//# sourceMappingURL=pool.js.map