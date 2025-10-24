// server/src/routes/authRoutes.js
const router = require("express").Router();
const { login, register } = require("../controllers/authController");
// If you also have a "me" endpoint, you can use auth here:
// const { authRequired } = require("../middlewares/auth");

// Base path is /api/v1/auth  (set in index.js)
// Therefore these must be relative paths like "/login" and "/register".
router.post("/login", login);
router.post("/register", register);

// Example (optional):
// router.get("/me", authRequired, me);

module.exports = router;
