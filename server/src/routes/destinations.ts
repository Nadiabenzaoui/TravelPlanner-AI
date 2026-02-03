import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiLimiter, ApiError, asyncHandler } from "../middleware/index.js";
import { z } from "zod";

const router = Router();

// Apply rate limiting
router.use(aiLimiter);

// Schema for validation
const insightsSchema = z.object({
    destination: z.string().min(2),
});

router.post(
    "/insights",
    asyncHandler(async (req: Request, res: Response) => {
        // Validate input manually since we're not using the full middleware chain for this simple route yet
        const validation = insightsSchema.safeParse(req.body);
        if (!validation.success) {
            throw ApiError.badRequest("Invalid destination");
        }

        const { destination } = validation.data;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw ApiError.internal("AI service not configured", "AI_CONFIG_ERROR");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Use the reliable model we found earlier
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        console.log(`Generating travel insights for: ${destination}`);

        const prompt = `
            Provide a practical 'Travel Toolkit' for a tourist visiting ${destination}.
            Focus on digital tools, entry requirements, and safety.
            
            Return ONLY a valid JSON object with this structure:
            {
                "apps": [
                    {
                        "name": "Name of app (e.g. Grab, Suica)",
                        "category": "Reason (Transport, Food, Chat)",
                        "description": "Short explanation why it's needed"
                    }
                ],
                "visa": {
                    "summary": "Concise summary of visa rules for EU/US citizens (e.g. 'Visa-free for 90 days')",
                    "warning": "Any important warning (e.g. 'Must have return ticket')"
                },
                "emergency": {
                    "police": "Number",
                    "ambulance": "Number"
                }
            }
            
            Limit "apps" to the top 4-5 absolutely essential local apps.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text().trim();
            const data = JSON.parse(text);

            res.json(data);
        } catch (err) {
            console.error("AI Insight Generation Failed:", err);
            throw ApiError.internal("Failed to generate insights");
        }
    })
);

export default router;
