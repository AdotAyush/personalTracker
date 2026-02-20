const Habit = require('../models/Habit.model');
const ActivityLog = require('../models/ActivityLog.model');
const { calculateStreak, buildHeatmapData, isSameDay, startOfDay } = require('../utils/date.utils');

class HabitService {
  async getHabits(userId, query = {}) {
    const filter = { userId, isArchived: false };
    if (query.category) filter.category = query.category;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    return Habit.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  }

  async createHabit(userId, data) {
    const habit = await Habit.create({ ...data, userId });
    await ActivityLog.create({
      userId,
      action: 'habit_created',
      resourceType: 'habit',
      resourceId: habit._id,
      metadata: { title: habit.title },
    });
    return habit;
  }

  async updateHabit(userId, habitId, updates) {
    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!habit) {
      const error = new Error('Habit not found');
      error.statusCode = 404;
      throw error;
    }
    return habit;
  }

  async deleteHabit(userId, habitId) {
    const habit = await Habit.findOneAndDelete({ _id: habitId, userId });
    if (!habit) {
      const error = new Error('Habit not found');
      error.statusCode = 404;
      throw error;
    }
    return habit;
  }

  /**
   * Log a habit completion for a specific date
   */
  async logCompletion(userId, habitId, { date = new Date(), value = 1, note }) {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      const error = new Error('Habit not found');
      error.statusCode = 404;
      throw error;
    }

    const targetDate = startOfDay(new Date(date));

    // Check if already completed for this date (for daily habits)
    const existingCompletion = habit.completions.find(c =>
      isSameDay(new Date(c.date), targetDate)
    );

    if (existingCompletion) {
      existingCompletion.value += value;
      existingCompletion.note = note || existingCompletion.note;
    } else {
      habit.completions.push({ date: targetDate, value, note });
    }

    habit.lastCompletedAt = new Date();
    habit.recalculateStreak();
    habit.completionRate = habit.getCompletionRate(30);
    await habit.save();

    await ActivityLog.create({
      userId,
      action: 'habit_completed',
      resourceType: 'habit',
      resourceId: habit._id,
      metadata: { title: habit.title, streak: habit.currentStreak, value },
    });

    return habit;
  }

  /**
   * Remove a completion entry for a specific date
   */
  async removeCompletion(userId, habitId, date) {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      const error = new Error('Habit not found');
      error.statusCode = 404;
      throw error;
    }

    const targetDate = startOfDay(new Date(date));
    habit.completions = habit.completions.filter(c => !isSameDay(new Date(c.date), targetDate));
    habit.recalculateStreak();
    habit.completionRate = habit.getCompletionRate(30);
    await habit.save();

    return habit;
  }

  /**
   * Get heatmap data for a specific year
   */
  async getHeatmapData(userId, habitId, year) {
    const habit = await Habit.findOne({ _id: habitId, userId }).lean();
    if (!habit) {
      const error = new Error('Habit not found');
      error.statusCode = 404;
      throw error;
    }
    return buildHeatmapData(habit.completions.map(c => c.date), year);
  }

  /**
   * Get today's habit summary for dashboard
   */
  async getTodaySummary(userId) {
    const habits = await Habit.find({ userId, isActive: true, isArchived: false }).lean();
    const today = startOfDay(new Date());

    const summary = habits.map(habit => {
      const todayCompletions = habit.completions.filter(c =>
        isSameDay(new Date(c.date), today)
      );
      const totalValue = todayCompletions.reduce((sum, c) => sum + c.value, 0);
      return {
        _id: habit._id,
        title: habit.title,
        icon: habit.icon,
        color: habit.color,
        targetValue: habit.targetValue,
        currentValue: totalValue,
        isCompleted: totalValue >= habit.targetValue,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
      };
    });

    const completedCount = summary.filter(h => h.isCompleted).length;
    return {
      habits: summary,
      completedCount,
      totalCount: summary.length,
      completionRate: summary.length ? Math.round((completedCount / summary.length) * 100) : 0,
    };
  }

  /**
   * Get aggregated stats across all habits
   */
  async getStats(userId, period = 30) {
    const habits = await Habit.find({ userId, isArchived: false }).lean();
    const stats = habits.map(h => ({
      id: h._id,
      title: h.title,
      icon: h.icon,
      color: h.color,
      currentStreak: h.currentStreak,
      longestStreak: h.longestStreak,
      totalCompletions: h.totalCompletions,
      completionRate: h.completionRate,
      category: h.category,
    }));

    return {
      totalHabits: habits.length,
      activeHabits: habits.filter(h => h.isActive).length,
      highestStreak: Math.max(0, ...habits.map(h => h.currentStreak)),
      totalCompletions: habits.reduce((sum, h) => sum + h.totalCompletions, 0),
      habits: stats,
    };
  }
}

module.exports = new HabitService();
