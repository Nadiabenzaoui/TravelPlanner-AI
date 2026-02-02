import { z } from "zod";

// Itinerary schemas
export const generateItinerarySchema = z.object({
    destination: z
        .string()
        .min(1, "Destination is required")
        .max(200, "Destination too long"),
    preferences: z.string().max(1000, "Preferences too long").optional(),
});

// Activity schema for itinerary
const activitySchema = z.object({
    time: z.string(),
    activity: z.string(),
    location: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

// Day schema for itinerary
const daySchema = z.object({
    dayNumber: z.number(),
    theme: z.string(),
    activities: z.array(activitySchema),
});

// Full itinerary schema
export const itinerarySchema = z.object({
    tripTitle: z.string(),
    destination: z.string(),
    days: z.array(daySchema),
    tips: z.array(z.string()).optional(),
});

// Trip schemas
export const createTripSchema = z.object({
    destination: z
        .string()
        .min(1, "Destination is required")
        .max(200, "Destination too long"),
    title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title too long"),
    itinerary: itinerarySchema,
});

export const deleteTripSchema = z.object({
    id: z.string().uuid("Invalid trip ID format"),
});

// Type exports
export type GenerateItineraryInput = z.infer<typeof generateItinerarySchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type DeleteTripInput = z.infer<typeof deleteTripSchema>;
export type Itinerary = z.infer<typeof itinerarySchema>;
