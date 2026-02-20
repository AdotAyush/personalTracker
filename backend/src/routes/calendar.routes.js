const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/calendar.controller');

router.use(authenticate);
router.route('/').get(getEvents).post(createEvent);
router.route('/:id').put(updateEvent).patch(updateEvent).delete(deleteEvent);

module.exports = router;
