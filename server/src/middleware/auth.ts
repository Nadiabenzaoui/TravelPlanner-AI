import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase.js";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email?: string;
    };
}

/**
 * Middleware to verify JWT token from Supabase
 * Extracts user from Authorization header and validates with Supabase
 */
export const verifyToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                error: "UNAUTHORIZED",
                message: "Missing or invalid authorization header",
            });
            return;
        }

        const token = authHeader.split(" ")[1];

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({
                error: "INVALID_TOKEN",
                message: "Invalid or expired token",
            });
            return;
        }

        req.user = {
            id: user.id,
            email: user.email,
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({
            error: "AUTH_ERROR",
            message: "Authentication failed",
        });
    }
};

/**
 * Optional auth middleware - doesn't block if no token provided
 * Useful for routes that work with or without authentication
 */
export const optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const { data: { user } } = await supabase.auth.getUser(token);

            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                };
            }
        }

        next();
    } catch (error) {
        // Continue without auth on error
        next();
    }
};
