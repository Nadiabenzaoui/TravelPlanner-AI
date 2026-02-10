
import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/index.js";
import axios from "axios";

const router = Router();

// Cache for unsplash results to avoid hitting rate limits too hard
// Simple in-memory cache: { query: { url: string, timestamp: number } }
const cache: Record<string, { url: string, timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

router.get(
    "/unsplash",
    asyncHandler(async (req: Request, res: Response) => {
        const query = req.query.query as string;

        if (!query) {
            return res.status(400).json({ error: "Query parameter is required" });
        }

        const cacheKey = query.toLowerCase().trim();
        const now = Date.now();

        // Check cache
        if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_DURATION)) {
            return res.json({ url: cache[cacheKey].url });
        }

        const accessKey = process.env.UNSPLASH_ACCESS_KEY;

        // If no key is provided, we can't use the official API.
        // We could return an error to let the client fallback to Pollinations.
        if (!accessKey) {
            console.warn("Unsplash API key missing. Returning 404 to trigger fallback.");
            return res.status(404).json({ error: "Unsplash API key not configured" });
        }

        try {
            // Call Unsplash API
            const response = await axios.get("https://api.unsplash.com/photos/random", {
                params: {
                    query: query,
                    orientation: "landscape",
                    per_page: 1
                },
                headers: {
                    Authorization: `Client-ID ${accessKey}`
                }
            });

            if (response.data && response.data.urls && response.data.urls.regular) {
                const imageUrl = response.data.urls.regular;

                // Update cache
                cache[cacheKey] = { url: imageUrl, timestamp: now };

                return res.json({ url: imageUrl });
            } else {
                return res.status(404).json({ error: "No image found" });
            }

        } catch (error) {
            console.error("Unsplash API error:", (error as any).message);
            // Return 404 so client can fallback
            return res.status(404).json({ error: "Failed to fetch from Unsplash" });
        }
    })
);

export default router;
