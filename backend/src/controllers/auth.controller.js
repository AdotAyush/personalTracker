const { asyncHandler } = require('../middleware/error.middleware');
const authService = require('../services/auth.service');
const { sendSuccess, sendCreated } = require('../utils/response.utils');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword]
 *             properties:
 *               name: { type: string, example: "John Doe" }
 *               email: { type: string, example: "john@example.com" }
 *               password: { type: string, example: "Password@123" }
 *               confirmPassword: { type: string, example: "Password@123" }
 *     responses:
 *       201: { description: User registered successfully }
 *       409: { description: Email already exists }
 */
const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);
  setRefreshTokenCookie(res, tokens.refreshToken);
  return sendCreated(res, {
    message: 'Account created successfully. Please verify your email.',
    data: { user, accessToken: tokens.accessToken },
  });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 */
const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.login({
    ...req.body,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
  setRefreshTokenCookie(res, tokens.refreshToken);
  return sendSuccess(res, {
    message: 'Login successful',
    data: { user, accessToken: tokens.accessToken },
  });
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 */
const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }
  const { tokens } = await authService.refreshToken({
    refreshToken,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
  setRefreshTokenCookie(res, tokens.refreshToken);
  return sendSuccess(res, {
    message: 'Token refreshed successfully',
    data: { accessToken: tokens.accessToken },
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and invalidate refresh token
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  await authService.logout({ userId: req.user._id, refreshToken });
  res.clearCookie('refreshToken', getCookieOptions());
  return sendSuccess(res, { message: 'Logged out successfully' });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 */
const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, { data: req.user });
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);
  return sendSuccess(res, {
    message: 'If that email is registered, you will receive a password reset link shortly.',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return sendSuccess(res, { message: 'Password reset successfully. Please log in.' });
});

const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail({ token: req.query.token });
  return sendSuccess(res, { message: 'Email verified successfully.' });
});

const googleCallback = asyncHandler(async (req, res) => {
  const { tokens } = await authService.googleAuth({
    user: req.user,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
  setRefreshTokenCookie(res, tokens.refreshToken);
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}`);
});

// ─── Cookie helpers ──────────────────────────────────────────────────────────
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, getCookieOptions());
};

module.exports = { register, login, refreshToken, logout, getMe, forgotPassword, resetPassword, verifyEmail, googleCallback };
