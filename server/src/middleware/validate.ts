import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, ZodIssue } from "zod";

/**
 * Middleware factory for request body validation using Zod schemas
 */
export const validateBody = <T>(schema: ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: "VALIDATION_ERROR",
                    message: "Invalid request data",
                    details: error.issues.map((e: ZodIssue) => ({
                        field: e.path.join("."),
                        message: e.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};

/**
 * Middleware factory for query params validation
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req.query);
            req.query = parsed as typeof req.query;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: "VALIDATION_ERROR",
                    message: "Invalid query parameters",
                    details: error.issues.map((e: ZodIssue) => ({
                        field: e.path.join("."),
                        message: e.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};
