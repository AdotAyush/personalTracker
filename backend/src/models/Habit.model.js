const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Habit:
 *       type: object
 *       required: [title, userId, frequency]
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         frequency: { type: string, enum: [daily, weekly, custom] }
 *         currentStreak: { type: integer }
 *         longestStreak: { type: integer }
 *         completionRate: { type: number }
 */
const completionEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  value: { type: Number, default: 1 }, // for measurable habits (e.g., 8 glasses of water)
  note: { type: String, maxlength: 500 },
  completedAt: { type: Date, default: Date.now },
}, { _id: true, timestamps: false });

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Habit title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  icon: { type: String, default: '✅' },
  color: { type: String, default: '#6366f1' },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily',
    required: true,
  },
  targetDays: [{ type: Number, min: 0, max: 6 }], // for weekly/custom: days of week
  targetValue: { type: Number, default: 1, min: 1 }, // daily target count
  unit: { type: String, maxlength: 20, default: 'times' }, // e.g., "glasses", "minutes", "km"
  category: {
    type: String,
    enum: ['health', 'fitness', 'learning', 'mindfulness', 'social', 'creative', 'finance', 'other'],
    default: 'other',
  },
  completions: [completionEntrySchema],
  currentStreak: { type: Number, default: 0, min: 0 },
  longestStreak: { type: Number, default: 0, min: 0 },
  totalCompletions: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0, min: 0, max: 100 },
  lastCompletedAt: Date,
  startDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  tags: [{ type: String, trim: true, maxlength: 50 }],
  reminderTime: String, // HH:MM format
  reminderDays: [{ type: Number, min: 0, max: 6 }],
  notes: {
    type: String,
    maxlength: 2000,
  },
  order: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// ─── Virtuals ────────────────────────────────────────────────────────────────
habitSchema.virtual('isCompletedToday').get(function () {
  if (!this.lastCompletedAt) return false;
  const today = new Date();
  const last = new Date(this.lastCompletedAt);
  return (
    last.getDate() === today.getDate() &&
    last.getMonth() === today.getMonth() &&
    last.getFullYear() === today.getFullYear()
  );
});

habitSchema.virtual('todayProgress').get(function () {
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));
  const todayCompletions = this.completions.filter(
    c => new Date(c.date) >= todayStart && new Date(c.date) <= todayEnd
  );
  const totalValue = todayCompletions.reduce((sum, c) => sum + c.value, 0);
  return {
    current: totalValue,
    target: this.targetValue,
    percentage: Math.min(100, Math.round((totalValue / this.targetValue) * 100)),
  };
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
habitSchema.index({ userId: 1, isActive: 1 });
habitSchema.index({ userId: 1, category: 1 });
habitSchema.index({ userId: 1, createdAt: -1 });
habitSchema.index({ 'completions.date': 1 });

// ─── Methods ─────────────────────────────────────────────────────────────────
habitSchema.methods.recalculateStreak = function () {
  const { calculateStreak } = require('../utils/date.utils');
  const dates = this.completions.map(c => c.date);
  const { current, longest } = calculateStreak(dates);
  this.currentStreak = current;
  this.longestStreak = Math.max(longest, this.longestStreak);
  this.totalCompletions = this.completions.length;
};

habitSchema.methods.getCompletionRate = function (days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const recentCompletions = this.completions.filter(c => new Date(c.date) >= cutoff);
  return Math.round((recentCompletions.length / days) * 100);
};

const Habit = mongoose.model('Habit', habitSchema);
module.exports = Habit;
