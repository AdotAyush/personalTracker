const Joi = require('joi');

const createHabitSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(1000).allow('', null),
  icon: Joi.string().max(10).default('✅'),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
  frequency: Joi.string().valid('daily', 'weekly', 'custom').default('daily'),
  targetDays: Joi.array().items(Joi.number().integer().min(0).max(6)).when('frequency', {
    is: Joi.valid('weekly', 'custom'),
    then: Joi.array().min(1).required(),
    otherwise: Joi.array().optional(),
  }),
  targetValue: Joi.number().integer().min(1).default(1),
  unit: Joi.string().max(20).default('times'),
  category: Joi.string().valid(
    'health', 'fitness', 'learning', 'mindfulness', 'social', 'creative', 'finance', 'other'
  ).default('other'),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).default([]),
  reminderTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(null).messages({
    'string.pattern.base': 'Reminder time must be in HH:MM format',
  }),
  reminderDays: Joi.array().items(Joi.number().integer().min(0).max(6)),
  notes: Joi.string().max(2000).allow('', null),
  startDate: Joi.date().iso().default(new Date()),
});

const updateHabitSchema = Joi.object({
  title: Joi.string().trim().max(200),
  description: Joi.string().trim().max(1000).allow('', null),
  icon: Joi.string().max(10),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
  frequency: Joi.string().valid('daily', 'weekly', 'custom'),
  targetDays: Joi.array().items(Joi.number().integer().min(0).max(6)),
  targetValue: Joi.number().integer().min(1),
  unit: Joi.string().max(20),
  category: Joi.string().valid('health', 'fitness', 'learning', 'mindfulness', 'social', 'creative', 'finance', 'other'),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10),
  reminderTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(null),
  reminderDays: Joi.array().items(Joi.number().integer().min(0).max(6)),
  notes: Joi.string().max(2000).allow('', null),
  isActive: Joi.boolean(),
  isArchived: Joi.boolean(),
  order: Joi.number().integer(),
}).min(1);

const logCompletionSchema = Joi.object({
  date: Joi.date().iso().default(new Date()),
  value: Joi.number().min(1).default(1),
  note: Joi.string().trim().max(500).allow('', null),
});

module.exports = { createHabitSchema, updateHabitSchema, logCompletionSchema };
