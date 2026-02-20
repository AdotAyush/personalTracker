const { asyncHandler } = require('../middleware/error.middleware');
const analyticsService = require('../services/analytics.service');
const { sendSuccess } = require('../utils/response.utils');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboardAnalytics(req.user._id);
  return sendSuccess(res, { data });
});

const getHeatmap = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const data = await analyticsService.getHabitHeatmap(req.user._id, year);
  return sendSuccess(res, { data });
});

const getPomodoroStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getPomodoroStats(req.user._id, req.query.period || 'week');
  return sendSuccess(res, { data: stats });
});

const getSevenDayTrend = asyncHandler(async (req, res) => {
  const data = await analyticsService.getSevenDayTrend(req.user._id);
  return sendSuccess(res, { data });
});

const logPomodoroSession = asyncHandler(async (req, res) => {
  const ActivityLog = require('../models/ActivityLog.model');
  await ActivityLog.create({
    userId: req.user._id,
    action: 'pomodoro_completed',
    resourceType: 'pomodoro',
    metadata: req.body,
  });
  return sendSuccess(res, { message: 'Pomodoro session logged' });
});

module.exports = { getDashboard, getHeatmap, getPomodoroStats, getSevenDayTrend, logPomodoroSession };
