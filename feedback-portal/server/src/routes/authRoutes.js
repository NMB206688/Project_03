// server/src/routes/authRoutes.js

const express = require('express');
const router = express.Router();            // Isolated sub-router for /auth
const { register, login } = require('../controllers/authController');

// POST /api/v1/auth/register → create account
router.post('/register', register);

// POST /api/v1/auth/login → sign in
router.post('/login', login);

module.exports = router;
