import { Router, Response, Request } from "express";
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

// --- PUBLIC ROUTES (No Auth Required) ---

// GET - Fetch a single trip by ID (Public or Private)
router.get("/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check for auth token optionally to identify owner
    let userId: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
    }

    const { data: trip, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !trip) {
        throw ApiError.notFound("Trip not found");
    }

    // Access Control: Allow if Public OR if User is Owner
    const isOwner = userId && trip.user_id === userId;
    const isPublic = trip.is_public;

    if (!isPublic && !isOwner) {
        throw ApiError.forbidden("This trip is private");
    }

    res.json({ trip, isOwner }); // Return isOwner for frontend logic
}));

// --- PROTECTED ROUTES (Auth Required) ---
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
                is_public: false // Default to private
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

// PUT - Toggle Share Status
router.put(
    "/:id/share",
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user!.id;
        const { id } = req.params;
        const { is_public } = req.body; // Expect boolean

        if (typeof is_public !== 'boolean') {
            throw ApiError.badRequest("is_public must be a boolean");
        }

        // Verify ownership and update
        const { data, error } = await supabase
            .from("trips")
            .update({ is_public })
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            console.error("Error updating trip share status:", error);
            throw ApiError.internal("Failed to update share status");
        }

        if (!data) {
            throw ApiError.notFound("Trip not found or permission denied");
        }

        res.json({ trip: data });
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
