const Task = require('../models/Task.model');
const ActivityLog = require('../models/ActivityLog.model');
const { getPaginationParams } = require('../utils/response.utils');

class TaskService {
  /**
   * Build query filter from request params
   */
  buildFilter(userId, query) {
    const filter = { userId, isArchived: query.isArchived || false };

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.tags) filter.tags = { $in: query.tags.split(',').map(t => t.trim()) };
    if (query.dueFrom || query.dueTo) {
      filter.dueDate = {};
      if (query.dueFrom) filter.dueDate.$gte = new Date(query.dueFrom);
      if (query.dueTo) filter.dueDate.$lte = new Date(query.dueTo);
    }
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    return filter;
  }

  /**
   * Get tasks with pagination and filtering
   */
  async getTasks(userId, query) {
    const { page, limit, skip } = getPaginationParams(query);
    const filter = this.buildFilter(userId, query);

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Task.countDocuments(filter),
    ]);

    return { tasks, total, page, limit };
  }

  /**
   * Get all tasks for Kanban view (no pagination)
   */
  async getKanbanTasks(userId) {
    const tasks = await Task.find({ userId, isArchived: false })
      .sort({ kanbanOrder: 1 })
      .lean();

    const columns = { todo: [], in_progress: [], done: [], cancelled: [] };
    tasks.forEach(task => {
      const col = task.kanbanColumn || task.status;
      if (columns[col]) columns[col].push(task);
    });

    return columns;
  }

  /**
   * Create a new task
   */
  async createTask(userId, data) {
    const task = await Task.create({ ...data, userId });
    await ActivityLog.create({
      userId,
      action: 'task_created',
      resourceType: 'task',
      resourceId: task._id,
      metadata: { title: task.title, priority: task.priority },
    });
    return task;
  }

  /**
   * Update a task by ID
   */
  async updateTask(userId, taskId, updates) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    if (updates.status === 'done') {
      await ActivityLog.create({
        userId,
        action: 'task_completed',
        resourceType: 'task',
        resourceId: task._id,
        metadata: { title: task.title },
      });
    }

    return task;
  }

  /**
   * Delete a task
   */
  async deleteTask(userId, taskId) {
    const task = await Task.findOneAndDelete({ _id: taskId, userId });
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    await ActivityLog.create({
      userId,
      action: 'task_deleted',
      resourceType: 'task',
      resourceId: task._id,
    });
    return task;
  }

  /**
   * Bulk reorder tasks (Kanban drag-drop)
   */
  async reorderTasks(userId, tasks) {
    const ops = tasks.map(({ id, kanbanColumn, kanbanOrder }) => ({
      updateOne: {
        filter: { _id: id, userId },
        update: { $set: { kanbanColumn, kanbanOrder, status: kanbanColumn } },
      },
    }));
    await Task.bulkWrite(ops);
  }

  /**
   * Add a subtask
   */
  async addSubtask(userId, taskId, subtaskData) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { $push: { subtasks: subtaskData } },
      { new: true }
    );
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  /**
   * Toggle subtask completion
   */
  async toggleSubtask(userId, taskId, subtaskId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      const error = new Error('Subtask not found');
      error.statusCode = 404;
      throw error;
    }

    subtask.isCompleted = !subtask.isCompleted;
    subtask.completedAt = subtask.isCompleted ? new Date() : undefined;
    await task.save();
    return task;
  }

  /**
   * Get tasks due in a date range (for calendar)
   */
  async getTasksInRange(userId, startDate, endDate) {
    return Task.find({
      userId,
      isArchived: false,
      dueDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).sort({ dueDate: 1 }).lean();
  }
}

module.exports = new TaskService();
