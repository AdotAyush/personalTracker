const mongoose = require('mongoose');

/**
 * Dynamic TimeTable system — users define their own column schema.
 * Each table has a columnDefs array (schema), and rows store data as a Map.
 */

const columnDefSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'select', 'multi_select', 'boolean', 'tags', 'url', 'email', 'phone'],
    required: true,
  },
  options: [{ // for select/multi_select types
    label: { type: String, required: true },
    color: { type: String, default: '#6366f1' },
    value: { type: String, required: true },
  }],
  isRequired: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false },
  width: { type: Number, default: 200, min: 50, max: 600 },
  order: { type: Number, default: 0 },
  defaultValue: mongoose.Schema.Types.Mixed,
  description: { type: String, maxlength: 500 },
}, { _id: false });

const rowSchema = new mongoose.Schema({
  order: { type: Number, default: 0 },
  data: { type: Map, of: mongoose.Schema.Types.Mixed, default: () => new Map() },
  isArchived: { type: Boolean, default: false },
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

const viewSettingsSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Default View' },
  sortBy: [{ columnId: String, direction: { type: String, enum: ['asc', 'desc'] } }],
  filters: [{
    columnId: String,
    operator: { type: String, enum: ['equals', 'contains', 'gt', 'lt', 'between', 'in', 'isEmpty', 'isNotEmpty'] },
    value: mongoose.Schema.Types.Mixed,
  }],
  groupBy: String,
  hiddenColumns: [String],
  pageSize: { type: Number, default: 20 },
}, { _id: true });

const timeTableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'TimeTable title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: { type: String, maxlength: 1000 },
  icon: { type: String, default: '📋' },
  color: { type: String, default: '#6366f1' },
  columnDefs: {
    type: [columnDefSchema],
    validate: {
      validator: (cols) => cols.length <= 50,
      message: 'Cannot have more than 50 columns',
    },
  },
  rows: {
    type: [rowSchema],
    validate: {
      validator: (rows) => rows.length <= 10000,
      message: 'Cannot have more than 10,000 rows',
    },
  },
  views: [viewSettingsSchema],
  activeViewId: mongoose.Schema.Types.ObjectId,
  isTemplate: { type: Boolean, default: false },
  templateCategory: String,
  isArchived: { type: Boolean, default: false },
  shareSettings: {
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String },
    allowedEditors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// ─── Virtuals ────────────────────────────────────────────────────────────────
timeTableSchema.virtual('rowCount').get(function () {
  return this.rows.filter(r => !r.isArchived).length;
});

timeTableSchema.virtual('columnCount').get(function () {
  return this.columnDefs.filter(c => !c.isHidden).length;
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
timeTableSchema.index({ userId: 1, isArchived: 1 });
timeTableSchema.index({ userId: 1, createdAt: -1 });
timeTableSchema.index({ 'shareSettings.shareToken': 1 }, { sparse: true });

const TimeTable = mongoose.model('TimeTable', timeTableSchema);
module.exports = TimeTable;
