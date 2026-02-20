const { asyncHandler } = require('../middleware/error.middleware');
const CalendarEvent = require('../models/CalendarEvent.model');
const { sendSuccess, sendCreated, sendNotFound } = require('../utils/response.utils');

const getEvents = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = { userId: req.user._id, isArchived: false };
  if (startDate || endDate) {
    filter.startDate = {};
    if (startDate) filter.startDate.$gte = new Date(startDate);
    if (endDate) filter.startDate.$lte = new Date(endDate);
  }
  const events = await CalendarEvent.find(filter).sort({ startDate: 1 }).lean();
  return sendSuccess(res, { data: events });
});

const createEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.create({ ...req.body, userId: req.user._id });
  return sendCreated(res, { data: event, message: 'Event created successfully' });
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!event) return sendNotFound(res, 'Event');
  return sendSuccess(res, { data: event, message: 'Event updated successfully' });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!event) return sendNotFound(res, 'Event');
  return sendSuccess(res, { message: 'Event deleted successfully' });
});

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
