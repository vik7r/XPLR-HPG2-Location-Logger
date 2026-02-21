const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// ✅ CORS configuration (dynamic + fallback)
const allowedOrigin = process.env.CLIENT_URL || "https://vr10.vercel.app";

app.use(cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected!"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define schema and model
const locationSchema = new mongoose.Schema({
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now }
});

const Location = mongoose.model("Location", locationSchema);

// POST: Save new location
app.post("/log", async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }

        const newLocation = new Location({ latitude, longitude });
        await newLocation.save();

        res.status(201).json({
            message: "✅ Location saved successfully!",
            data: newLocation
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET: Fetch all locations
app.get("/logs", async (req, res) => {
    try {
        const locations = await Location.find().sort({ timestamp: -1 });
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server with proper port binding for Render
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
