import { Router, Response } from "express";
import { supabase } from "../lib/supabase.js";
import { verifyToken, AuthenticatedRequest, ApiError, asyncHandler } from "../middleware/index.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET - Fetch user profile
router.get("/", asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    const { count, error } = await supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

    if (error) {
        console.error("Error fetching profile:", error);
        throw ApiError.internal("Failed to fetch profile");
    }

    res.json({
        user: {
            id: userId,
            email: userEmail,
        },
        stats: {
            trips_count: count || 0,
        },
    });
}));

export default router;
