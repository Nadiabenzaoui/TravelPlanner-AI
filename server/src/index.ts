import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import itineraryRoutes from "./routes/itinerary.js";
import tripsRoutes from "./routes/trips.js";
import profileRoutes from "./routes/profile.js";
import destinationsRouter from "./routes/destinations.js";
import {
    generalLimiter,
    requestLogger,
    errorHandler,
    notFoundHandler,
} from "./middleware/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Global middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());
app.use(requestLogger);
app.use(generalLimiter);

// Health check (no auth required)
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/destinations", destinationsRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
