const crypto = require('crypto');
const User = require('../models/User.model');
const ActivityLog = require('../models/ActivityLog.model');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt.utils');
const { EmailService } = require('./email.service');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken: crypto.createHash('sha256').update(verificationToken).digest('hex'),
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    // Send verification email (non-blocking)
    EmailService.sendVerificationEmail(user.email, user.name, verificationToken)
      .catch(err => logger.error('Failed to send verification email:', err));

    await ActivityLog.create({ userId: user._id, action: 'login', resourceType: 'user' });

    const tokens = generateTokenPair(user._id, user.role);
    return { user, tokens };
  }

  /**
   * Login with email/password
   */
  async login({ email, password, userAgent, ipAddress }) {
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Your account has been deactivated. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const tokens = generateTokenPair(user._id, user.role);
    await user.addRefreshToken(tokens.refreshToken, userAgent, ipAddress);

    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();

    await ActivityLog.create({ userId: user._id, action: 'login', resourceType: 'user', ip: ipAddress });

    return { user, tokens };
  }

  /**
   * Refresh access token
   */
  async refreshToken({ refreshToken, userAgent, ipAddress }) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(payload.sub).select('+refreshTokens');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
    if (!tokenExists) {
      // Token reuse detected — revoke all tokens (security measure)
      await user.revokeAllRefreshTokens();
      logger.warn(`Refresh token reuse detected for user ${user._id}`);
      const error = new Error('Token reuse detected. All sessions have been invalidated.');
      error.statusCode = 401;
      throw error;
    }

    // Rotate refresh token
    await user.removeRefreshToken(refreshToken);
    const tokens = generateTokenPair(user._id, user.role);
    await user.addRefreshToken(tokens.refreshToken, userAgent, ipAddress);

    return { tokens };
  }

  /**
   * Logout — invalidate refresh token
   */
  async logout({ userId, refreshToken }) {
    const user = await User.findById(userId).select('+refreshTokens');
    if (user && refreshToken) {
      await user.removeRefreshToken(refreshToken);
    }
    await ActivityLog.create({ userId, action: 'logout', resourceType: 'user' });
  }

  /**
   * Send forgot password email
   */
  async forgotPassword({ email }) {
    const user = await User.findOne({ email });
    // Always respond the same way to prevent email enumeration
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    EmailService.sendPasswordResetEmail(user.email, user.name, resetToken)
      .catch(err => logger.error('Failed to send password reset email:', err));
  }

  /**
   * Reset password with token
   */
  async resetPassword({ token, password }) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      throw error;
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.revokeAllRefreshTokens();
    await user.save();

    EmailService.sendPasswordChangedEmail(user.email, user.name)
      .catch(err => logger.error('Failed to send password changed email:', err));
  }

  /**
   * Verify email address
   */
  async verifyEmail({ token }) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error('Invalid or expired verification token');
      error.statusCode = 400;
      throw error;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return user;
  }

  /**
   * Handle Google OAuth callback
   */
  async googleAuth({ user, userAgent, ipAddress }) {
    const tokens = generateTokenPair(user._id, user.role);
    await User.findById(user._id).then(async (u) => {
      if (u) {
        const fullUser = await User.findById(u._id).select('+refreshTokens');
        await fullUser.addRefreshToken(tokens.refreshToken, userAgent, ipAddress);
        fullUser.lastLoginAt = new Date();
        fullUser.loginCount += 1;
        await fullUser.save();
      }
    });
    return { user, tokens };
  }
}

module.exports = new AuthService();
