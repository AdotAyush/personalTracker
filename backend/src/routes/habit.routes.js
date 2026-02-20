const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createHabitSchema, updateHabitSchema, logCompletionSchema } = require('../validations/habit.validation');
const {
  getHabits, getTodaySummary, getHabitById, createHabit, updateHabit,
  deleteHabit, logCompletion, removeCompletion, getHeatmap, getStats,
} = require('../controllers/habit.controller');

router.use(authenticate);

router.get('/today', getTodaySummary);
router.get('/stats', getStats);

router.route('/')
  .get(getHabits)
  .post(validate(createHabitSchema), createHabit);

router.route('/:id')
  .get(getHabitById)
  .put(validate(updateHabitSchema), updateHabit)
  .patch(validate(updateHabitSchema), updateHabit)
  .delete(deleteHabit);

router.post('/:id/complete', validate(logCompletionSchema), logCompletion);
router.delete('/:id/complete', removeCompletion);
router.get('/:id/heatmap', getHeatmap);

module.exports = router;
