import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

// GET - Récupérer le profil utilisateur
router.get("/", async (req: Request, res: Response) => {
    try {
        const userId = req.headers["x-user-id"] as string;
        const userEmail = req.headers["x-user-email"] as string;

        if (!userId) {
            res.status(401).json({ error: "Non authentifié" });
            return;
        }

        // Compter les trips de l'utilisateur
        const { count } = await supabase
            .from("trips")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);

        res.json({
            user: {
                id: userId,
                email: userEmail,
            },
            stats: {
                trips_count: count || 0,
            },
        });
    } catch (error: any) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

export default router;
