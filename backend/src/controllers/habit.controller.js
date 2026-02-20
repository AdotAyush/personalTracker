const { asyncHandler } = require('../middleware/error.middleware');
const habitService = require('../services/habit.service');
const { sendSuccess, sendCreated } = require('../utils/response.utils');

const getHabits = asyncHandler(async (req, res) => {
  const habits = await habitService.getHabits(req.user._id, req.query);
  return sendSuccess(res, { data: habits });
});

const getTodaySummary = asyncHandler(async (req, res) => {
  const summary = await habitService.getTodaySummary(req.user._id);
  return sendSuccess(res, { data: summary });
});

const getHabitById = asyncHandler(async (req, res) => {
  const Habit = require('../models/Habit.model');
  const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
  if (!habit) return require('../utils/response.utils').sendNotFound(res, 'Habit');
  return sendSuccess(res, { data: habit });
});

const createHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.createHabit(req.user._id, req.body);
  return sendCreated(res, { data: habit, message: 'Habit created successfully' });
});

const updateHabit = asyncHandler(async (req, res) => {
  const habit = await habitService.updateHabit(req.user._id, req.params.id, req.body);
  return sendSuccess(res, { data: habit, message: 'Habit updated successfully' });
});

const deleteHabit = asyncHandler(async (req, res) => {
  await habitService.deleteHabit(req.user._id, req.params.id);
  return sendSuccess(res, { message: 'Habit deleted successfully' });
});

const logCompletion = asyncHandler(async (req, res) => {
  const habit = await habitService.logCompletion(req.user._id, req.params.id, req.body);
  return sendSuccess(res, { data: habit, message: 'Habit completion logged!' });
});

const removeCompletion = asyncHandler(async (req, res) => {
  const habit = await habitService.removeCompletion(req.user._id, req.params.id, req.body.date);
  return sendSuccess(res, { data: habit, message: 'Completion removed' });
});

const getHeatmap = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const data = await habitService.getHeatmapData(req.user._id, req.params.id, year);
  return sendSuccess(res, { data });
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await habitService.getStats(req.user._id);
  return sendSuccess(res, { data: stats });
});

module.exports = {
  getHabits, getTodaySummary, getHabitById, createHabit, updateHabit,
  deleteHabit, logCompletion, removeCompletion, getHeatmap, getStats,
};
