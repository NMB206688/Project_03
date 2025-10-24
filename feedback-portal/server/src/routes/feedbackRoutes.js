// server/src/routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();

const {
  createFeedback,
  listFeedback,
  updateStatus,
} = require("../controllers/feedbackController");

const {
  authOptional,  // reads user from token if present; otherwise continues
  ensureAdmin,   // [authRequired, adminOnly]
} = require("../middleware/auth");

// Create feedback
// - Public allowed (anonymous), but if a valid token is present we save createdBy.
router.post("/", authOptional, createFeedback);

// List feedback
// - Public listing allowed; if a token is present, controller can tailor results.
router.get("/", authOptional, listFeedback);

// Update feedback status (admin only)
router.patch("/:id/status", ensureAdmin, updateStatus);

module.exports = router;
