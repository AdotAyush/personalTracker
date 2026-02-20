const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required: [title, userId]
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         description: { type: string }
 *         status: { type: string, enum: [todo, in_progress, done, cancelled] }
 *         priority: { type: string, enum: [low, medium, high, urgent] }
 *         dueDate: { type: string, format: date-time }
 *         tags: { type: array, items: { type: string } }
 */
const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 500 },
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
}, { timestamps: true });

const reminderSchema = new mongoose.Schema({
  time: { type: Date, required: true },
  type: { type: String, enum: ['email', 'push', 'both'], default: 'push' },
  isSent: { type: Boolean, default: false },
}, { _id: false });

const recurrenceSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
    required: true,
  },
  interval: { type: Number, default: 1, min: 1 }, // every N days/weeks/months
  daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sun, 6=Sat
  dayOfMonth: { type: Number, min: 1, max: 31 },
  endDate: Date,
  maxOccurrences: Number,
  occurrenceCount: { type: Number, default: 0 },
}, { _id: false });

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'done', 'cancelled'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  dueDate: { type: Date },
  completedAt: Date,
  estimatedMinutes: { type: Number, min: 0 },
  actualMinutes: { type: Number, min: 0 },
  tags: [{ type: String, trim: true, maxlength: 50 }],
  subtasks: [subtaskSchema],
  reminders: [reminderSchema],
  recurrence: recurrenceSchema,
  parentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  kanbanColumn: { type: String, default: 'todo' },
  kanbanOrder: { type: Number, default: 0 },
  calendarEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'CalendarEvent' },
  pomodoroCount: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// ─── Virtuals ────────────────────────────────────────────────────────────────
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'done') return false;
  return new Date(this.dueDate) < new Date();
});

taskSchema.virtual('subtaskProgress').get(function () {
  if (!this.subtasks.length) return null;
  const done = this.subtasks.filter(s => s.isCompleted).length;
  return { done, total: this.subtasks.length, percentage: Math.round((done / this.subtasks.length) * 100) };
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
taskSchema.index({ userId: 1, status: 1, priority: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, tags: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ title: 'text', description: 'text', tags: 'text' });

// ─── Hooks ───────────────────────────────────────────────────────────────────
taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'done' && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.isModified('status') && this.status !== 'done') {
    this.completedAt = undefined;
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
