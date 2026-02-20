const { asyncHandler } = require('../middleware/error.middleware');
const User = require('../models/User.model');
const { sendSuccess, sendNotFound } = require('../utils/response.utils');

const getProfile = asyncHandler(async (req, res) => {
  return sendSuccess(res, { data: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'avatar'];
  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );
  return sendSuccess(res, { data: user, message: 'Profile updated successfully' });
});

const updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { preferences: { ...req.user.preferences.toObject?.() || {}, ...req.body } } },
    { new: true, runValidators: true }
  );
  return sendSuccess(res, { data: user.preferences, message: 'Preferences updated' });
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(req.body.currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = req.body.newPassword;
  await user.revokeAllRefreshTokens();
  await user.save();
  return sendSuccess(res, { message: 'Password changed successfully. Please log in again.' });
});

const subscribePush = asyncHandler(async (req, res) => {
  const { NotificationService } = require('../services/notification.service');
  await NotificationService.subscribe(req.user._id, req.body);
  return sendSuccess(res, { message: 'Push notifications enabled' });
});

const unsubscribePush = asyncHandler(async (req, res) => {
  const { NotificationService } = require('../services/notification.service');
  await NotificationService.unsubscribe(req.user._id, req.body.endpoint);
  return sendSuccess(res, { message: 'Push notifications disabled' });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(req.body.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Incorrect password' });
  }
  // Soft delete
  await User.findByIdAndUpdate(req.user._id, { isActive: false, email: `deleted_${Date.now()}_${user.email}` });
  return sendSuccess(res, { message: 'Account deactivated successfully' });
});

module.exports = { getProfile, updateProfile, updatePreferences, changePassword, subscribePush, unsubscribePush, deleteAccount };
