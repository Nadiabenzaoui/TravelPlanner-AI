import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

// GET - Récupérer tous les trips d'un utilisateur
router.get("/", async (req: Request, res: Response) => {
    try {
        const userId = req.headers["x-user-id"] as string;

        if (!userId) {
            res.status(401).json({ error: "Non authentifié" });
            return;
        }

        const { data: trips, error } = await supabase
            .from("trips")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching trips:", error);
            res.status(500).json({ error: "Erreur lors de la récupération" });
            return;
        }

        res.json({ trips });
    } catch (error: any) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// POST - Sauvegarder un nouveau trip
router.post("/", async (req: Request, res: Response) => {
    try {
        const userId = req.headers["x-user-id"] as string;

        if (!userId) {
            res.status(401).json({ error: "Non authentifié" });
            return;
        }

        const { destination, title, itinerary } = req.body;

        if (!destination || !title || !itinerary) {
            res.status(400).json({ error: "Destination, title et itinerary requis" });
            return;
        }

        const { data, error } = await supabase
            .from("trips")
            .insert({
                user_id: userId,
                destination,
                title,
                itinerary,
            })
            .select()
            .single();

        if (error) {
            console.error("Error saving trip:", error);
            res.status(500).json({ error: "Erreur lors de la sauvegarde" });
            return;
        }

        res.status(201).json({ trip: data });
    } catch (error: any) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// DELETE - Supprimer un trip
router.delete("/", async (req: Request, res: Response) => {
    try {
        const userId = req.headers["x-user-id"] as string;

        if (!userId) {
            res.status(401).json({ error: "Non authentifié" });
            return;
        }

        const { id } = req.body;

        if (!id) {
            res.status(400).json({ error: "ID requis" });
            return;
        }

        const { error } = await supabase
            .from("trips")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (error) {
            console.error("Error deleting trip:", error);
            res.status(500).json({ error: "Erreur lors de la suppression" });
            return;
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

export default router;
