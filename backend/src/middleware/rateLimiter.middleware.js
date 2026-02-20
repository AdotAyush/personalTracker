const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const createLimiter = (options) => rateLimit({
  windowMs: options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: options.max || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: options.message || 'Too many requests. Please try again later.',
    retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000),
  },
  skip: (req) => process.env.NODE_ENV === 'test',
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded: ${req.ip} → ${req.path}`);
    res.status(429).json(options.message);
  },
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
});

// General API limiter
const globalRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many API requests. Please slow down.',
});

// Strict limiter for auth endpoints
const authRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: 'Too many authentication attempts. Please wait 15 minutes.',
  keyGenerator: (req) => req.ip,
});

// Moderate limiter for data writes
const writeLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many write operations. Please wait a moment.',
});

module.exports = { globalRateLimiter, authRateLimiter, writeLimiter };
