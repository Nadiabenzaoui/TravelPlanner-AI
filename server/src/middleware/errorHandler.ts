import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    statusCode: number;
    code: string;

    constructor(statusCode: number, code: string, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = "ApiError";
    }

    static badRequest(message: string, code = "BAD_REQUEST") {
        return new ApiError(400, code, message);
    }

    static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED") {
        return new ApiError(401, code, message);
    }

    static forbidden(message = "Forbidden", code = "FORBIDDEN") {
        return new ApiError(403, code, message);
    }

    static notFound(message = "Resource not found", code = "NOT_FOUND") {
        return new ApiError(404, code, message);
    }

    static internal(message = "Internal server error", code = "INTERNAL_ERROR") {
        return new ApiError(500, code, message);
    }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error("Error:", {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });

    const statusCode = err.statusCode || 500;
    const code = err.code || "INTERNAL_ERROR";
    const message = err.message || "An unexpected error occurred";

    res.status(statusCode).json({
        error: code,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (_req: Request, res: Response) => {
    res.status(404).json({
        error: "NOT_FOUND",
        message: "The requested resource was not found",
    });
};
