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

        // Models ordered by preference
        // Verified available models as of Feb 2026
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-pro-latest"
        ];

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting generation with model: ${modelName}`);
                // Enable JSON mode for more reliable output
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: { responseMimeType: "application/json" }
                });

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
                                        "lng": 0.0,
                                        "image_prompt": "Keyword for image search (e.g. 'Eiffel Tower', 'Sushi', 'Beach')"
                                    }
                                ]
                            }
                        ],
                        "tips": ["Tip 1"],
                        "smart_features": {
                            "budget_estimator": {
                                "total_estimated": 1200,
                                "currency": "EUR",
                                "breakdown": { "flights": 200, "accommodation": 600, "activities": 200, "food": 200 },
                                "budget_tips": ["Tip 1", "Tip 2"]
                            },
                            "packing_list": {
                                "weather_forecast": "Expected weather summary",
                                "essentials": ["Item 1", "Item 2"]
                            },
                            "local_vibe": {
                                "etiquette_tips": ["Tip 1", "Tip 2"],
                                "survival_phrases": [
                                    { "original": "Hello", "pronunciation": "Pronunciation", "meaning": "Hello" }
                                ]
                            }
                        }
                    }

                    VERY IMPORTANT: For each activity, specify the approximate "lat" (latitude) and "lng" (longitude) for its location so I can show it on a map.
                    For the budget, estimate realistic costs for a standard traveler.
                `;

                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();
                // With JSON mode, we shouldn't get markdown backticks, but a safe trim never hurts
                const jsonText = text.trim();
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
