
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Load .env from server root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Fetching available models...");
        // Hack: generic any to bypass potential type restrictions if listModels isn't in top level
        // Actually it is on the manager, but sometimes simpler to just request via a model?
        // No, typically:
        // const models = await genAI.listModels(); -> disallowed in some SDK versions?

        // Let's try standard way, if it fails we might need another approach
        // Note: listModels is not on GoogleGenerativeAI instance in older versions, 
        // but checking node_modules would be slow.
        // Let's assume this is newer SDK (0.24.1).

        // While SDK documentation says 'getGenerativeModel', listing is often hidden.
        // Let's try a direct fetch if we can't find the method.
        // But for this environment, let's try to update the CODE to print models on failure.

        // Actually, easier strategy: Update itinerary.ts to log models if they fail. 
        // But I want to fix it NOW.

        // Let's guess standard numbered versions which usually work:
        // gemini-1.5-flash-001
        // gemini-1.5-pro-001
        // gemini-1.0-pro

        // I will just write this script to BE SURE.
    } catch (error) {
        // ...
    }
}

// Actually, I'll just skip the script and modify the route to log available models on error
// This is more robust because it runs in the actual environment.
