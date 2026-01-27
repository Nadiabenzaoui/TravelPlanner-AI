const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY non trouvée dans le fichier .env");
        return;
    }

    console.log("🔍 Test de connexion Gemini avec la clé:", apiKey.substring(0, 8) + "...");
    const genAI = new GoogleGenerativeAI(apiKey);

    const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro"];

    for (const modelName of models) {
        try {
            console.log(`\n🚀 Test du modèle: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Dis 'Bonjour' en un mot.");
            const response = await result.response;
            console.log(`✅ Succès avec ${modelName}:`, response.text());
            return; // On s'arrête dès qu'un marche
        } catch (error) {
            console.error(`❌ Échec avec ${modelName}:`, error.message);
        }
    }

    console.log("\n--- BILAN ---");
    console.log("Tous les modèles ont échoué. Cela signifie généralement que:");
    console.log("1. La région (France/Europe) bloque certains modèles sur le Free Tier.");
    console.log("2. L'API 'Generative Language API' n'est pas activée dans Google AI Studio.");
    console.log("3. Ta clé API a un problème de permissions.");
}

testGemini();
