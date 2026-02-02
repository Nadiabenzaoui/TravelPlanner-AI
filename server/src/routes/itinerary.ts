import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

router.post("/generate", async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY || "";

    try {
        if (!apiKey) {
            console.error("CRITICAL: GEMINI_API_KEY is missing.");
            res.status(500).json({ error: "API Key missing in .env" });
            return;
        }

        const { destination, preferences } = req.body;

        if (!destination) {
            res.status(400).json({ error: "Destination is required" });
            return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const modelsToTry = [
            "gemini-flash-latest",
            "gemini-pro-latest",
            "gemini-2.0-flash"
        ];
        let lastError: any = null;

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
                const response = await result.response;
                const text = response.text();
                const jsonText = text.replace(/```json|```/g, "").trim();
                const itinerary = JSON.parse(jsonText);

                res.json(itinerary);
                return;
            } catch (err: any) {
                console.error(`Model ${modelName} failed:`, err.message);
                lastError = err;
            }
        }

        res.status(500).json({
            error: "All AI models failed to respond.",
            details: lastError?.message || "Unknown error",
            hint: "Check if your API Key is active and has Gemini API enabled in Google AI Studio."
        });
    } catch (error: any) {
        console.error("Global Route Error:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

export default router;
