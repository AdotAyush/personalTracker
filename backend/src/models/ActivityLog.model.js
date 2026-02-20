const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'task_created', 'task_completed', 'task_updated', 'task_deleted',
      'habit_completed', 'habit_created', 'habit_updated', 'habit_skipped',
      'timetable_created', 'timetable_updated',
      'event_created', 'event_updated', 'event_deleted',
      'pomodoro_completed', 'pomodoro_started',
      'streak_achieved', 'goal_achieved',
      'login', 'logout',
    ],
    index: true,
  },
  resourceType: {
    type: String,
    enum: ['task', 'habit', 'timetable', 'event', 'pomodoro', 'user', 'goal'],
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  ip: String,
  userAgent: String,
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
  versionKey: false,
});

// TTL — auto-delete logs older than 90 days
activityLogSchema.index({ date: 1 }, { expireAfterSeconds: 7776000 });
activityLogSchema.index({ userId: 1, action: 1, date: -1 });
activityLogSchema.index({ userId: 1, resourceType: 1, date: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
