const logger = require('../utils/logger');

/**
 * Attach request metadata and log incoming requests
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  req.requestId = require('crypto').randomUUID();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?._id?.toString() || 'anonymous',
      userAgent: req.headers['user-agent'],
    };

    if (res.statusCode >= 500) {
      logger.error('Request error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request warning', logData);
    } else if (process.env.NODE_ENV !== 'production' || duration > 1000) {
      logger.debug('Request completed', logData);
    }
  });

  next();
};

/**
 * Log validation errors
 */
const validationLogger = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && !body.success && body.errors) {
      logger.debug('Validation errors', {
        path: req.originalUrl,
        errors: body.errors,
      });
    }
    return originalJson(body);
  };
  next();
};

module.exports = { requestLogger, validationLogger };
