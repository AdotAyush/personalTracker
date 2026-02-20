/**
 * Standardized API response utilities
 */

const sendSuccess = (res, { data = null, message = 'Success', statusCode = 200, meta = null } = {}) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const sendCreated = (res, { data, message = 'Resource created successfully' } = {}) => {
  return sendSuccess(res, { data, message, statusCode: 201 });
};

const sendPaginated = (res, { data, total, page, limit, message = 'Success' } = {}) => {
  const pages = Math.ceil(total / limit);
  res.setHeader('X-Total-Count', total);
  res.setHeader('X-Page-Count', pages);
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: parseInt(page),
      pages,
      limit: parseInt(limit),
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
  });
};

const sendError = (res, { message = 'An error occurred', statusCode = 500, errors = null } = {}) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendUnauthorized = (res, message = 'Unauthorized. Please log in.') => {
  return sendError(res, { message, statusCode: 401 });
};

const sendForbidden = (res, message = 'You do not have permission to perform this action.') => {
  return sendError(res, { message, statusCode: 403 });
};

const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, { message: `${resource} not found`, statusCode: 404 });
};

const sendValidationError = (res, errors) => {
  return sendError(res, { message: 'Validation failed', statusCode: 422, errors });
};

const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendValidationError,
  getPaginationParams,
};
