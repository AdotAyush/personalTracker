const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validate, validateQuery } = require('../middleware/validation.middleware');
const { writeLimiter } = require('../middleware/rateLimiter.middleware');
const { createTaskSchema, updateTaskSchema, reorderTasksSchema, taskQuerySchema } = require('../validations/task.validation');
const {
  getTasks, getKanbanTasks, getTaskById, createTask, updateTask,
  deleteTask, reorderTasks, addSubtask, toggleSubtask, getTasksInRange,
} = require('../controllers/task.controller');

router.use(authenticate);

router.route('/')
  .get(validateQuery(taskQuerySchema), getTasks)
  .post(writeLimiter, validate(createTaskSchema), createTask);

router.get('/kanban', getKanbanTasks);
router.get('/range', getTasksInRange);
router.put('/reorder', reorderTasks);

router.route('/:id')
  .get(getTaskById)
  .put(validate(updateTaskSchema), updateTask)
  .patch(validate(updateTaskSchema), updateTask)
  .delete(deleteTask);

router.post('/:id/subtasks', addSubtask);
router.patch('/:id/subtasks/:subtaskId/toggle', toggleSubtask);

module.exports = router;
