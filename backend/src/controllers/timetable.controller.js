const { asyncHandler } = require('../middleware/error.middleware');
const TimeTable = require('../models/TimeTable.model');
const { sendSuccess, sendCreated, sendNotFound, getPaginationParams, sendPaginated } = require('../utils/response.utils');
const { v4: uuidv4 } = require('uuid');

const getTimetables = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const filter = { userId: req.user._id, isArchived: false };
  const [tables, total] = await Promise.all([
    TimeTable.find(filter, '-rows').sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    TimeTable.countDocuments(filter),
  ]);
  return sendPaginated(res, { data: tables, total, page, limit });
});

const getTimetableById = asyncHandler(async (req, res) => {
  const table = await TimeTable.findOne({ _id: req.params.id, userId: req.user._id });
  if (!table) return sendNotFound(res, 'TimeTable');
  return sendSuccess(res, { data: table });
});

const createTimetable = asyncHandler(async (req, res) => {
  const table = await TimeTable.create({ ...req.body, userId: req.user._id });
  return sendCreated(res, { data: table, message: 'TimeTable created successfully' });
});

const updateTimetable = asyncHandler(async (req, res) => {
  const { rows, ...updateData } = req.body; // don't allow bulk row replacement via this endpoint
  const table = await TimeTable.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!table) return sendNotFound(res, 'TimeTable');
  return sendSuccess(res, { data: table });
});

const deleteTimetable = asyncHandler(async (req, res) => {
  const table = await TimeTable.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!table) return sendNotFound(res, 'TimeTable');
  return sendSuccess(res, { message: 'TimeTable deleted successfully' });
});

// ─── Column Operations ───────────────────────────────────────────────────────
const addColumn = asyncHandler(async (req, res) => {
  const column = { ...req.body, id: uuidv4() };
  const table = await TimeTable.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $push: { columnDefs: column } },
    { new: true }
  );
  if (!table) return sendNotFound(res, 'TimeTable');
  return sendSuccess(res, { data: table, message: 'Column added' });
});

const updateColumn = asyncHandler(async (req, res) => {
  const { columnId } = req.params;
  const table = await TimeTable.findOne({ _id: req.params.id, userId: req.user._id });
  if (!table) return sendNotFound(res, 'TimeTable');
  const col = table.columnDefs.find(c => c.id === columnId);
  if (!col) return sendNotFound(res, 'Column');
  Object.assign(col, req.body);
  await table.save();
  return sendSuccess(res, { data: table });
});

const deleteColumn = asyncHandler(async (req, res) => {
  const { columnId } = req.params;
  const table = await TimeTable.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $pull: { columnDefs: { id: columnId } } },
    { new: true }
  );
  if (!table) return sendNotFound(res, 'TimeTable');
  return sendSuccess(res, { data: table });
});

const reorderColumns = asyncHandler(async (req, res) => {
  const { columnIds } = req.body; // ordered array of column IDs
  const table = await TimeTable.findOne({ _id: req.params.id, userId: req.user._id });
  if (!table) return sendNotFound(res, 'TimeTable');
  columnIds.forEach((id, index) => {
    const col = table.columnDefs.find(c => c.id === id);
    if (col) col.order = index;
  });
  table.columnDefs.sort((a, b) => a.order - b.order);
  await table.save();
  return sendSuccess(res, { data: table });
});

// ─── Row Operations ──────────────────────────────────────────────────────────
const addRow = asyncHandler(async (req, res) => {
  const table = await TimeTable.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $push: { rows: { data: req.body.data || {}, order: req.body.order || 0 } } },
    { new: true }
  );
  if (!table) return sendNotFound(res, 'TimeTable');
  const newRow = table.rows[table.rows.length - 1];
  return sendCreated(res, { data: newRow });
});

const updateRow = asyncHandler(async (req, res) => {
  const { rowId } = req.params;
  const table = await TimeTable.findOne({ _id: req.params.id, userId: req.user._id });
  if (!table) return sendNotFound(res, 'TimeTable');
  const row = table.rows.id(rowId);
  if (!row) return sendNotFound(res, 'Row');
  if (req.body.data) Object.assign(row.data, req.body.data);
  if (req.body.order !== undefined) row.order = req.body.order;
  await table.save();
  return sendSuccess(res, { data: row });
});

const deleteRow = asyncHandler(async (req, res) => {
  const table = await TimeTable.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $pull: { rows: { _id: req.params.rowId } } },
    { new: true }
  );
  if (!table) return sendNotFound(res, 'TimeTable');
  return sendSuccess(res, { message: 'Row deleted' });
});

module.exports = {
  getTimetables, getTimetableById, createTimetable, updateTimetable, deleteTimetable,
  addColumn, updateColumn, deleteColumn, reorderColumns,
  addRow, updateRow, deleteRow,
};
