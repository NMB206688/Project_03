require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const commentRoutes = require("./routes/commentRoutes");

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/feedback_portal_dev";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const app = express();

// Behind reverse proxies (Railway/Render/Heroku) so req.ip works correctly
app.set("trust proxy", 1);

// Security & basics
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

// ---- CORS (supports comma-separated list or "*") ----
const allowedOrigins = CORS_ORIGIN.split(",").map((s) => s.trim());
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow curl/Postman/same-origin
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: false,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

// ---- Rate limit for all /api* routes ----
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// ---- Health checks ----
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ---- API routes ----
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1", commentRoutes);

// ---- Express v5-safe 404 (NO "*" wildcard) ----
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ---- Centralized error handler ----
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err?.stack || err);
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS blocked" });
  }
  res.status(500).json({ error: "Internal server error" });
});

// ---- Start ----
mongoose
  .connect(MONGODB_URI, { autoIndex: true })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log("BOOT: Express v5-safe server starting. CORS_ORIGIN =", CORS_ORIGIN);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

module.exports = app;
