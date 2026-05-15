import { Request, Response, NextFunction } from "express";
export interface AuthPayload {
    userId: string;
    email: string;
    role: "customer" | "admin";
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): void;
export declare function generateToken(payload: AuthPayload): string;
//# sourceMappingURL=auth.d.ts.map