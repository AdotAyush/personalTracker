const Joi = require('joi');

const subtaskSchema = Joi.object({
  title: Joi.string().trim().max(500).required(),
  isCompleted: Joi.boolean().default(false),
});

const reminderSchema = Joi.object({
  time: Joi.date().iso().required(),
  type: Joi.string().valid('email', 'push', 'both').default('push'),
});

const recurrenceSchema = Joi.object({
  frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'custom').required(),
  interval: Joi.number().integer().min(1).default(1),
  daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)),
  dayOfMonth: Joi.number().integer().min(1).max(31),
  endDate: Joi.date().iso(),
  maxOccurrences: Joi.number().integer().min(1),
});

const createTaskSchema = Joi.object({
  title: Joi.string().trim().max(500).required(),
  description: Joi.string().trim().max(5000).allow('', null),
  status: Joi.string().valid('todo', 'in_progress', 'done', 'cancelled').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  dueDate: Joi.date().iso().allow(null),
  estimatedMinutes: Joi.number().integer().min(0).allow(null),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(20).default([]),
  subtasks: Joi.array().items(subtaskSchema).max(50).default([]),
  reminders: Joi.array().items(reminderSchema).max(5).default([]),
  recurrence: recurrenceSchema.allow(null),
  parentTaskId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
  kanbanColumn: Joi.string().default('todo'),
  kanbanOrder: Joi.number().integer().default(0),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().max(500),
  description: Joi.string().trim().max(5000).allow('', null),
  status: Joi.string().valid('todo', 'in_progress', 'done', 'cancelled'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  dueDate: Joi.date().iso().allow(null),
  estimatedMinutes: Joi.number().integer().min(0).allow(null),
  actualMinutes: Joi.number().integer().min(0).allow(null),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(20),
  subtasks: Joi.array().items(subtaskSchema.concat(Joi.object({ _id: Joi.string() }))).max(50),
  reminders: Joi.array().items(reminderSchema).max(5),
  recurrence: recurrenceSchema.allow(null),
  kanbanColumn: Joi.string(),
  kanbanOrder: Joi.number().integer(),
  isArchived: Joi.boolean(),
}).min(1);

const reorderTasksSchema = Joi.object({
  tasks: Joi.array().items(Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    kanbanColumn: Joi.string().required(),
    kanbanOrder: Joi.number().integer().required(),
  })).min(1).required(),
});

const taskQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('todo', 'in_progress', 'done', 'cancelled'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  search: Joi.string().trim().max(200),
  tags: Joi.string(),
  dueFrom: Joi.date().iso(),
  dueTo: Joi.date().iso(),
  sortBy: Joi.string().valid('dueDate', 'priority', 'createdAt', 'title', 'kanbanOrder').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  isArchived: Joi.boolean().default(false),
});

module.exports = { createTaskSchema, updateTaskSchema, reorderTasksSchema, taskQuerySchema };
