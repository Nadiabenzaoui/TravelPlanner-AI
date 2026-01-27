import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || "";

  try {
    if (!apiKey) {
      console.error("CRITICAL: GEMINI_API_KEY is missing.");
      return NextResponse.json({ error: "API Key missing in .env" }, { status: 500 });
    }

    const { destination, preferences } = await req.json();
    if (!destination) return NextResponse.json({ error: "Destination is required" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(apiKey);

    // Attempt models in order of preference using aliases that your key explicitly authorizes
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
                  { "time": "09:00", "activity": "Description", "location": "Place" }
                ]
              }
            ],
            "tips": ["Tip 1"]
          }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonText = text.replace(/```json|```/g, "").trim();
        const itinerary = JSON.parse(jsonText);

        // Success - Save to Supabase (silent) and return
        try {
          const { supabase } = await import("@/lib/supabase");
          if (supabase) {
            await supabase.from("trips").insert([{
              destination: itinerary.destination,
              title: itinerary.tripTitle,
              itinerary: itinerary,
              preferences: preferences || "None",
            }]);
          }
        } catch (e) { console.error("DB Save failed", e); }

        return NextResponse.json(itinerary);
      } catch (err: any) {
        console.error(`Model ${modelName} failed:`, err.message);
        lastError = err;
        // If it's a quota error or something similar, it might apply to all models, 
        // but we try the next one anyway.
      }
    }

    // If we reach here, all models failed
    return NextResponse.json({
      error: "All AI models failed to respond.",
      details: lastError?.message || "Unknown error",
      hint: "Check if your API Key is active and has Gemini API enabled in Google AI Studio."
    }, { status: 500 });

  } catch (error: any) {
    console.error("Global Route Error:", error);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
