const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getTimetables, getTimetableById, createTimetable, updateTimetable, deleteTimetable,
  addColumn, updateColumn, deleteColumn, reorderColumns,
  addRow, updateRow, deleteRow,
} = require('../controllers/timetable.controller');

router.use(authenticate);

router.route('/')
  .get(getTimetables)
  .post(createTimetable);

router.route('/:id')
  .get(getTimetableById)
  .put(updateTimetable)
  .patch(updateTimetable)
  .delete(deleteTimetable);

// Column routes
router.post('/:id/columns', addColumn);
router.put('/:id/columns/:columnId', updateColumn);
router.delete('/:id/columns/:columnId', deleteColumn);
router.put('/:id/columns/reorder', reorderColumns);

// Row routes
router.post('/:id/rows', addRow);
router.put('/:id/rows/:rowId', updateRow);
router.delete('/:id/rows/:rowId', deleteRow);

module.exports = router;
