// server/src/routes/feedbackRoutes.js
const router = require("express").Router();
const {
  createFeedback,
  listFeedback,
  updateStatus,
} = require("../controllers/feedbackController");
const {
  authOptional,
  adminOnly,
  // backward-compat aliases, if other modules use them
  requireAuthOptional,
  requireSuperAdmin,
} = require("../middleware/auth");

// Create: anyone can post; if logged in and not anonymous, controller can use req.user
router.post("/", authOptional /* or requireAuthOptional */, createFeedback);

// List: optional auth for UX (admins may see more fields, handled in controller)
router.get("/", authOptional /* or requireAuthOptional */, listFeedback);

// Status change: admin only (PATCH /api/v1/feedback/:id/status)
router.patch(
  "/:id/status",
  adminOnly /* or requireSuperAdmin */,
  updateStatus
);

module.exports = router;
