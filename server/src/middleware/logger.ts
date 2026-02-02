import { Request, Response, NextFunction } from "express";

/**
 * Request logging middleware
 * Logs method, path, status, and response time
 */
export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const start = Date.now();
    const requestId = generateRequestId();

    // Attach request ID to request object
    (req as any).requestId = requestId;

    // Log incoming request
    console.log(`[${requestId}] --> ${req.method} ${req.path}`);

    // Log response when finished
    res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const statusIcon = status >= 400 ? "✗" : "✓";

        console.log(
            `[${requestId}] <-- ${req.method} ${req.path} ${statusIcon} ${status} (${duration}ms)`
        );
    });

    next();
};

/**
 * Generate a short unique request ID
 */
function generateRequestId(): string {
    return Math.random().toString(36).substring(2, 10);
}
