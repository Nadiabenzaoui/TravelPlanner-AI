import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { destination, preferences } = await req.json();

    if (!destination) {
      return NextResponse.json({ error: "Destination is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Create a detailed travel itinerary for ${destination}.
      Preferences: ${preferences || "No specific preferences"}.
      
      Please provide a JSON object with the following structure:
      {
        "tripTitle": "Title of the trip",
        "destination": "${destination}",
        "days": [
          {
            "dayNumber": 1,
            "theme": "Day theme",
            "activities": [
              {
                "time": "e.g. 09:00",
                "activity": "Description of the activity",
                "location": "Name of the place"
              }
            ]
          }
        ],
        "tips": ["Tip 1", "Tip 2"]
      }
      
      Ensure the output is valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean potential markdown formatting from JSON
    const jsonText = text.replace(/```json|```/g, "").trim();
    const itinerary = JSON.parse(jsonText);

    // Save to Supabase (Optional/Silent)
    try {
      const { supabase } = await import("@/lib/supabase");
      if (supabase) {
        await supabase.from("trips").insert([
          {
            destination: itinerary.destination,
            title: itinerary.tripTitle,
            itinerary: itinerary,
            preferences: preferences || "None",
          }
        ]);
      }
    } catch (dbError) {
      console.error("Database Save Error (Skipped):", dbError);
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 });
  }
}
