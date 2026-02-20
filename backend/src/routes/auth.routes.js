const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { authRateLimiter } = require('../middleware/rateLimiter.middleware');
const {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
} = require('../validations/auth.validation');
const {
  register, login, refreshToken, logout, getMe,
  forgotPassword, resetPassword, verifyEmail, googleCallback,
} = require('../controllers/auth.controller');

// Public routes (rate limited)
router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', authRateLimiter, refreshToken);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPassword);
router.get('/verify-email', verifyEmail);

// Google OAuth
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth` }),
  googleCallback
);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

module.exports = router;
