const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         role: { type: string, enum: [user, admin] }
 *         avatar: { type: string }
 *         isEmailVerified: { type: boolean }
 *         preferences: { type: object }
 *         createdAt: { type: string, format: date-time }
 */
const pushSubscriptionSchema = new mongoose.Schema({
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
}, { _id: false });

const userPreferencesSchema = new mongoose.Schema({
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  accentColor: { type: String, default: '#6366f1' },
  weekStartsOn: { type: Number, enum: [0, 1], default: 1 }, // 0=Sun, 1=Mon
  timeFormat: { type: String, enum: ['12h', '24h'], default: '12h' },
  dateFormat: { type: String, default: 'MMM dd, yyyy' },
  language: { type: String, default: 'en' },
  timezone: { type: String, default: 'UTC' },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    taskReminders: { type: Boolean, default: true },
    habitReminders: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
  },
  pomodoroSettings: {
    workDuration: { type: Number, default: 25 },
    shortBreak: { type: Number, default: 5 },
    longBreak: { type: Number, default: 15 },
    sessionsBeforeLongBreak: { type: Number, default: 4 },
    autoStartBreaks: { type: Boolean, default: false },
    autoStartPomodoros: { type: Boolean, default: false },
    soundEnabled: { type: Boolean, default: true },
  },
  dashboard: {
    layout: { type: String, enum: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
    widgets: [{ type: String }],
  },
}, { _id: false });

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' },
  userAgent: String,
  ipAddress: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: function () { return !this.googleId; },
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  googleId: { type: String, sparse: true },
  avatar: {
    type: String,
    default: function () {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=6366f1&color=fff`;
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'premium'],
    default: 'user',
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  refreshTokens: { type: [refreshTokenSchema], select: false, default: [] },
  pushSubscriptions: [pushSubscriptionSchema],
  preferences: { type: userPreferencesSchema, default: () => ({}) },
  lastLoginAt: Date,
  loginCount: { type: Number, default: 0 },
  productivityScore: { type: Number, default: 0, min: 0, max: 100 },
  onboardingCompleted: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.__v;
      return ret;
    },
  },
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ createdAt: -1 });

// ─── Hooks ───────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Methods ─────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addRefreshToken = async function (token, userAgent, ipAddress) {
  // Keep max 5 active refresh tokens per user (device management)
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift();
  }
  this.refreshTokens.push({ token, userAgent, ipAddress });
  await this.save();
};

userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter(t => t.token !== token);
  await this.save();
};

userSchema.methods.revokeAllRefreshTokens = async function () {
  this.refreshTokens = [];
  await this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
