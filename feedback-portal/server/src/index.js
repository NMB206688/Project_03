// 1) Load environment variables early so later code can read them.
require('dotenv').config();

// 2) Core imports.
const express = require('express');          // Web server & routing
const mongoose = require('mongoose');        // MongoDB ODM (schemas/models)

// 3) Security/utility middlewares.
const helmet = require('helmet');            // Secure HTTP headers
const cors = require('cors');                // Cross-origin access for our React app
const morgan = require('morgan');            // Request logging
const rateLimit = require('express-rate-limit'); // Basic abuse protection

// 4) App routes (ADD: auth routes).
const authRoutes = require('./routes/authRoutes'); // <= NEW: /auth endpoints

// 5) Read env with safe fallbacks for local dev.
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feedback_portal_dev';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// 6) Create the Express app.
const app = express();

// 7) Global middlewares.
app.use(helmet());                           // Sets headers like X-Frame-Options, etc.
app.use(cors({ origin: CORS_ORIGIN }));      // Only allow our front-end origin
app.use(morgan('dev'));                      // Logs: METHOD PATH STATUS TIME
app.use(express.json({ limit: '1mb' }));     // Parse JSON bodies; limit prevents huge payloads

// 8) Rate limit all /api routes (100 req/15min per IP).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// 9) Health check (for quick tests/monitors; never expose secrets).
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 10) Root API info route.
app.get('/api/v1', (req, res) => {
  res.json({ message: 'Feedback Portal API v1' });
});

// 11) Mount feature routers (ADD: auth).
//     Why: keeps endpoints organized under /api/v1/*
app.use('/api/v1/auth', authRoutes);

// 12) Connect DB first, then start the server (fail fast if DB is down).
mongoose
  .connect(MONGODB_URI, { autoIndex: true })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

  const { requireAuth, requireAdmin } = require('./middleware/auth'); // <— add at top with other imports



// Simple "who am I" protected route (requires any valid token)
app.get('/api/v1/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Example admin-only route
app.get('/api/v1/admin/ping', requireAuth, requireAdmin, (req, res) => {
  res.json({ ok: true, msg: 'admin access confirmed' });
});

// add near other imports
const feedbackRoutes = require('./routes/feedbackRoutes');
// mount under /api/v1/feedback
app.use('/api/v1/feedback', feedbackRoutes);
