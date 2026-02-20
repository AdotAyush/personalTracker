const passport = require('../config/passport');
const { sendUnauthorized, sendForbidden } = require('../utils/response.utils');
const logger = require('../utils/logger');

/**
 * Authenticate via JWT Bearer token
 */
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      logger.error('Auth middleware error:', err);
      return sendUnauthorized(res, 'Authentication error');
    }
    if (!user) {
      const message = info?.message || 'Invalid or expired token. Please log in again.';
      return sendUnauthorized(res, message);
    }
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Optional authentication — doesn't block if no token, but populates req.user if valid
 */
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (!err && user) req.user = user;
    next();
  })(req, res, next);
};

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res);
    }
    if (!roles.includes(req.user.role)) {
      return sendForbidden(res, `Role '${req.user.role}' is not authorized for this action`);
    }
    next();
  };
};

/**
 * Ensure the authenticated user can only access their own resources
 */
const ownResourceOnly = (userIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    if (!resourceUserId) return next(); // let controller handle
    if (req.user.role === 'admin') return next(); // admins bypass
    if (String(resourceUserId) !== String(req.user._id)) {
      return sendForbidden(res);
    }
    next();
  };
};

module.exports = { authenticate, optionalAuth, authorize, ownResourceOnly };
