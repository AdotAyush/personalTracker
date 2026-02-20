const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate a signed JWT access token
 */
const generateAccessToken = (userId, role = 'user') => {
  return jwt.sign(
    { sub: userId, role, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      algorithm: 'HS256',
      issuer: 'personaltracker.app',
    }
  );
};

/**
 * Generate a signed JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { sub: userId, type: 'refresh', jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      algorithm: 'HS256',
      issuer: 'personaltracker.app',
    }
  );
};

/**
 * Verify an access token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    algorithms: ['HS256'],
    issuer: 'personaltracker.app',
  });
};

/**
 * Verify a refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    algorithms: ['HS256'],
    issuer: 'personaltracker.app',
  });
};

/**
 * Decode a token without verification (for extracting claims from expired tokens)
 */
const decodeToken = (token) => jwt.decode(token);

/**
 * Generate token pair (access + refresh)
 */
const generateTokenPair = (userId, role = 'user') => ({
  accessToken: generateAccessToken(userId, role),
  refreshToken: generateRefreshToken(userId),
});

/**
 * Get token expiry as Date object
 */
const getTokenExpiry = (expiresIn) => {
  const ms = parseExpiry(expiresIn);
  return new Date(Date.now() + ms);
};

const parseExpiry = (expiry) => {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiry}`);
  return parseInt(match[1]) * units[match[2]];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiry,
};
