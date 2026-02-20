const Task = require('../models/Task.model');
const Habit = require('../models/Habit.model');
const ActivityLog = require('../models/ActivityLog.model');
const { getDateRange, buildHeatmapData } = require('../utils/date.utils');

class AnalyticsService {
  /**
   * Calculate overall productivity score (0-100)
   */
  calculateProductivityScore({ taskCompletionRate, habitCompletionRate, streakBonus }) {
    const taskWeight = 0.4;
    const habitWeight = 0.4;
    const streakWeight = 0.2;
    return Math.round(
      taskCompletionRate * taskWeight +
      habitCompletionRate * habitWeight +
      Math.min(streakBonus, 100) * streakWeight
    );
  }

  /**
   * Get full dashboard analytics
   */
  async getDashboardAnalytics(userId) {
    const { start: weekStart, end: weekEnd } = getDateRange('week');
    const { start: monthStart, end: monthEnd } = getDateRange('month');

    const [
      weekTasks, monthTasks, allHabits, recentActivity,
    ] = await Promise.all([
      Task.find({ userId, isArchived: false, dueDate: { $gte: weekStart, $lte: weekEnd } }).lean(),
      Task.find({ userId, isArchived: false, dueDate: { $gte: monthStart, $lte: monthEnd } }).lean(),
      Habit.find({ userId, isActive: true, isArchived: false }).lean(),
      ActivityLog.find({ userId, date: { $gte: weekStart } }).sort({ date: -1 }).limit(50).lean(),
    ]);

    // Task metrics
    const weekCompletedTasks = weekTasks.filter(t => t.status === 'done').length;
    const weekTaskRate = weekTasks.length
      ? Math.round((weekCompletedTasks / weekTasks.length) * 100)
      : 0;

    const monthCompletedTasks = monthTasks.filter(t => t.status === 'done').length;

    // Habit metrics
    const habitCompletionRates = allHabits.map(h => h.completionRate || 0);
    const avgHabitRate = habitCompletionRates.length
      ? Math.round(habitCompletionRates.reduce((a, b) => a + b, 0) / habitCompletionRates.length)
      : 0;

    const bestStreak = Math.max(0, ...allHabits.map(h => h.currentStreak));
    const streakBonus = Math.min(bestStreak * 5, 100);

    const productivityScore = this.calculateProductivityScore({
      taskCompletionRate: weekTaskRate,
      habitCompletionRate: avgHabitRate,
      streakBonus,
    });

    // Overdue tasks
    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      userId,
      isArchived: false,
      status: { $nin: ['done', 'cancelled'] },
      dueDate: { $lt: now },
    });

    // Priority distribution
    const priorityDist = await Task.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()), isArchived: false, status: { $nin: ['done', 'cancelled'] } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // 7-day task completion trend
    const sevenDayTrend = await this.getSevenDayTrend(userId);

    return {
      productivityScore,
      tasks: {
        thisWeek: { total: weekTasks.length, completed: weekCompletedTasks, rate: weekTaskRate },
        thisMonth: { total: monthTasks.length, completed: monthCompletedTasks },
        overdue: overdueTasks,
        priorityDistribution: priorityDist,
      },
      habits: {
        total: allHabits.length,
        avgCompletionRate: avgHabitRate,
        bestStreak,
        totalCompletions: allHabits.reduce((sum, h) => sum + h.totalCompletions, 0),
      },
      recentActivity: recentActivity.slice(0, 20),
      sevenDayTrend,
    };
  }

  /**
   * Task completion trend for last 7 days
   */
  async getSevenDayTrend(userId) {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const results = await Promise.all(
      days.map(async (day) => {
        const start = new Date(day.setHours(0, 0, 0, 0));
        const end = new Date(day.setHours(23, 59, 59, 999));
        const [total, completed] = await Promise.all([
          Task.countDocuments({ userId, createdAt: { $gte: start, $lte: end } }),
          Task.countDocuments({ userId, completedAt: { $gte: start, $lte: end } }),
        ]);
        return {
          date: start.toISOString().split('T')[0],
          created: total,
          completed,
        };
      })
    );

    return results;
  }

  /**
   * Get habit heatmap for analytics page
   */
  async getHabitHeatmap(userId, year) {
    const habits = await Habit.find({ userId, isArchived: false }).lean();
    const allDates = habits.flatMap(h => h.completions.map(c => c.date));
    return buildHeatmapData(allDates, year);
  }

  /**
   * Pomodoro session stats
   */
  async getPomodoroStats(userId, period = 'week') {
    const { start, end } = getDateRange(period);
    const logs = await ActivityLog.find({
      userId,
      action: 'pomodoro_completed',
      date: { $gte: start, $lte: end },
    }).lean();

    return {
      totalSessions: logs.length,
      totalMinutes: logs.length * 25, // 25 min default
      period,
    };
  }
}

module.exports = new AnalyticsService();
