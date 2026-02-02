import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateBody, aiLimiter, ApiError, asyncHandler } from "../middleware/index.js";
import { generateItinerarySchema } from "../schemas/index.js";

const router = Router();

// Apply rate limiting to AI endpoint
router.use(aiLimiter);

router.post(
    "/generate",
    validateBody(generateItinerarySchema),
    asyncHandler(async (req: Request, res: Response) => {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw ApiError.internal("AI service not configured", "AI_CONFIG_ERROR");
        }

        const { destination, preferences } = req.body;

        const genAI = new GoogleGenerativeAI(apiKey);

        // Models ordered by preference (faster/cheaper first)
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro-latest",
            "gemini-pro",
        ];
        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting generation with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const prompt = `
                    Create a detailed travel itinerary for ${destination}.
                    Preferences: ${preferences || "No specific preferences"}.

                    Return ONLY a JSON object with this exact structure:
                    {
                        "tripTitle": "Title of the trip",
                        "destination": "${destination}",
                        "days": [
                            {
                                "dayNumber": 1,
                                "theme": "Day theme",
                                "activities": [
                                    {
                                        "time": "09:00",
                                        "activity": "Description",
                                        "location": "Place",
                                        "lat": 0.0,
                                        "lng": 0.0
                                    }
                                ]
                            }
                        ],
                        "tips": ["Tip 1"]
                    }

                    VERY IMPORTANT: For each activity, specify the approximate "lat" (latitude) and "lng" (longitude) for its location so I can show it on a map.
                `;

                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();
                const jsonText = text.replace(/```json|```/g, "").trim();
                const itinerary = JSON.parse(jsonText);

                res.json(itinerary);
                return;
            } catch (err) {
                console.error(`Model ${modelName} failed:`, (err as Error).message);
            }
        }

        throw ApiError.internal(
            "All AI models failed to respond",
            "AI_GENERATION_ERROR"
        );
    })
);

export default router;
