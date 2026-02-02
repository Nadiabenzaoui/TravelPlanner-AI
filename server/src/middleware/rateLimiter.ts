import rateLimit from "express-rate-limit";

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for AI generation endpoint
 * 10 requests per 15 minutes per IP (Gemini API is expensive)
 */
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many AI generation requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Auth rate limiter to prevent brute force
 * 5 requests per minute per IP
 */
export const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: {
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many authentication attempts, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
