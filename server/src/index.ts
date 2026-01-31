import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import itineraryRoutes from "./routes/itinerary.js";
import tripsRoutes from "./routes/trips.js";
import profileRoutes from "./routes/profile.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/profile", profileRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
