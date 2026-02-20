const Joi = require('joi');
const { sendValidationError } = require('../utils/response.utils');

/**
 * Factory: create a middleware that validates req.body with a Joi schema
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return sendValidationError(res, errors);
    }

    req[source] = value; // replace with sanitized value
    next();
  };
};

/**
 * Validate query params
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate route params
 */
const validateParams = (schema) => validate(schema, 'params');

/**
 * Common param schemas
 */
const objectIdSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid ID format',
  }),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(200).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = { validate, validateQuery, validateParams, objectIdSchema, paginationSchema };
