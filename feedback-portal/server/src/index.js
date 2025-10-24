// server/src/index.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Routes
const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const commentRoutes = require("./routes/commentRoutes");

// ---- Config ----
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/feedback_portal_dev";

// Comma-separated list of allowed origins (or "*")
const CORS_ORIGIN =
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,http://127.0.0.1:5173";

// ---- App ----
const app = express();

// behind proxies (Railway/Render/Vercel/Heroku) so req.ip works correctly
app.set("trust proxy", 1);

// security & basics
app.use(
  helmet({
    // allow embedding if your frontend needs it; otherwise remove this
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

// ---- CORS ----
// Support: multiple origins, "*", Authorization header, and non-GET methods
const allowedOrigins = CORS_ORIGIN.split(",").map((s) => s.trim());
const corsOptions = {
  origin(origin, cb) {
    // Allow same-origin / curl / Postman (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: false,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
};
app.use(cors(corsOptions));
// Preflight for all routes
//app.options("*", cors(corsOptions));

// ---- Rate limit everything under /api ----
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// ---- Health checks ----
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ---- API routes ----
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1", commentRoutes);

// ---- 404 (Express v5-safe; NO "*" wildcard) ----
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
    console.log("➡️  CORS_ORIGIN:", CORS_ORIGIN);
    console.log("➡️  Allowed origins parsed:", allowedOrigins);
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

module.exports = app;
