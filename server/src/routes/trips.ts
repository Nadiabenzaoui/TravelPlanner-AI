import { Router, Response } from "express";
import { supabase } from "../lib/supabase.js";
import {
    verifyToken,
    validateBody,
    AuthenticatedRequest,
    ApiError,
    asyncHandler,
} from "../middleware/index.js";
import { createTripSchema, deleteTripSchema } from "../schemas/index.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET - Fetch all trips for authenticated user
router.get("/", asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const { data: trips, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching trips:", error);
        throw ApiError.internal("Failed to fetch trips");
    }

    res.json({ trips });
}));

// GET - Fetch a single trip by ID
router.get("/:id", asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const { data: trip, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

    if (error) {
        console.error("Error fetching trip:", error);
        throw ApiError.notFound("Trip not found");
    }

    res.json({ trip });
}));

// POST - Save a new trip
router.post(
    "/",
    validateBody(createTripSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user!.id;
        const { destination, title, itinerary } = req.body;

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
            throw ApiError.internal("Failed to save trip");
        }

        res.status(201).json({ trip: data });
    })
);

// DELETE - Remove a trip
router.delete(
    "/",
    validateBody(deleteTripSchema),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user!.id;
        const { id } = req.body;

        const { error } = await supabase
            .from("trips")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (error) {
            console.error("Error deleting trip:", error);
            throw ApiError.internal("Failed to delete trip");
        }

        res.json({ success: true });
    })
);

export default router;
