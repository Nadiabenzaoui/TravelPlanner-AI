const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY non trouvée dans le fichier .env");
        return;
    }

    console.log("🔍 Récupération de la liste des modèles pour la clé:", apiKey.substring(0, 8) + "...");

    try {
        // Note: listModels is a top-level method in some versions or requires a specific client
        // Using the REST API directly is sometimes more reliable for diagnostics
        const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ Erreur API Google:", data.error.message);
            if (data.error.status === "INVALID_ARGUMENT") {
                console.log("💡 Conseil: Vérifie que ta clé API est bien copiée sans espaces.");
            }
            return;
        }

        console.log("\n✅ Modèles disponibles pour ta clé :");
        if (data.models && data.models.length > 0) {
            data.models.forEach(m => {
                console.log(`- ${m.name} (Supporte: ${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("Aucun modèle trouvé. Ta clé n'a peut-être pas les permissions nécessaires.");
        }

    } catch (error) {
        console.error("❌ Erreur lors de la requête:", error.message);
    }
}

listModels();
