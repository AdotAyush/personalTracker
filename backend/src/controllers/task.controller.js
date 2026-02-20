const { asyncHandler } = require('../middleware/error.middleware');
const taskService = require('../services/task.service');
const { sendSuccess, sendCreated, sendPaginated, sendNotFound } = require('../utils/response.utils');

const getTasks = asyncHandler(async (req, res) => {
  const { tasks, total, page, limit } = await taskService.getTasks(req.user._id, req.query);
  return sendPaginated(res, { data: { tasks }, total, page, limit });
});

const getKanbanTasks = asyncHandler(async (req, res) => {
  const columns = await taskService.getKanbanTasks(req.user._id);
  return sendSuccess(res, { data: columns });
});

const getTaskById = asyncHandler(async (req, res) => {
  const Task = require('../models/Task.model');
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) return sendNotFound(res, 'Task');
  return sendSuccess(res, { data: task });
});

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user._id, req.body);
  return sendCreated(res, { data: task, message: 'Task created successfully' });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.user._id, req.params.id, req.body);
  return sendSuccess(res, { data: task, message: 'Task updated successfully' });
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.user._id, req.params.id);
  return sendSuccess(res, { message: 'Task deleted successfully' });
});

const reorderTasks = asyncHandler(async (req, res) => {
  await taskService.reorderTasks(req.user._id, req.body.tasks);
  return sendSuccess(res, { message: 'Tasks reordered successfully' });
});

const addSubtask = asyncHandler(async (req, res) => {
  const task = await taskService.addSubtask(req.user._id, req.params.id, req.body);
  return sendSuccess(res, { data: task, message: 'Subtask added' });
});

const toggleSubtask = asyncHandler(async (req, res) => {
  const task = await taskService.toggleSubtask(req.user._id, req.params.id, req.params.subtaskId);
  return sendSuccess(res, { data: task });
});

const getTasksInRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const tasks = await taskService.getTasksInRange(req.user._id, startDate, endDate);
  return sendSuccess(res, { data: tasks });
});

module.exports = {
  getTasks, getKanbanTasks, getTaskById, createTask, updateTask,
  deleteTask, reorderTasks, addSubtask, toggleSubtask, getTasksInRange,
};
