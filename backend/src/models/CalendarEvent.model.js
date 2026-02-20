const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: 300,
  },
  description: { type: String, maxlength: 5000 },
  type: {
    type: String,
    enum: ['event', 'task', 'habit', 'reminder', 'block'],
    default: 'event',
  },
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date, required: true },
  isAllDay: { type: Boolean, default: false },
  color: { type: String, default: '#6366f1' },
  category: {
    type: String,
    enum: ['work', 'personal', 'health', 'social', 'learning', 'other'],
    default: 'personal',
  },
  location: { type: String, maxlength: 500 },
  url: String,
  recurrence: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    interval: { type: Number, default: 1 },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    endDate: Date,
    maxOccurrences: Number,
  },
  reminders: [{
    minutesBefore: { type: Number, default: 15 },
    type: { type: String, enum: ['email', 'push', 'both'], default: 'push' },
    isSent: { type: Boolean, default: false },
  }],
  refTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  refHabitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit' },
  isArchived: { type: Boolean, default: false },
  attendees: [{ email: String, name: String, status: { type: String, enum: ['pending', 'accepted', 'declined'] } }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

calendarEventSchema.index({ userId: 1, startDate: 1, endDate: 1 });
calendarEventSchema.index({ userId: 1, type: 1, startDate: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
module.exports = CalendarEvent;
