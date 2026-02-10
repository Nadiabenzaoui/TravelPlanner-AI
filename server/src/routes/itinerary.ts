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

                    Return ONLY a JSON object with this exact structure. 
                    IMPORTANT: The values in the example below are just placeholders. You must generate REALISTIC and DYNAMIC content based on the destination "${destination}" and the preferences provided. 
                    Do NOT copy the numbers or text from the example budget or vibe sections; calculate them specific to the location.

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
                                "total_estimated": 0,
                                "currency": "Local Currency Code (e.g. EUR, JPY, USD)",
                                "breakdown": { "flights": 0, "accommodation": 0, "activities": 0, "food": 0 },
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

                    VERY IMPORTANT: 
                    1. For each activity, specify the approximate "lat" (latitude) and "lng" (longitude) for its location so I can show it on a map.
                    2. For "budget_estimator", you MUST calculate a realistic total and breakdown in the local currency of ${destination} or USD/EUR. Do NOT use the placeholder 1200. Estimate costs for flights (from a major hub), mid-range accommodation, and daily expenses.
                    3. For "local_vibe", provide actual cultural tips and phrases for ${destination}.
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
