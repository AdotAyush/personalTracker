const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, differenceInDays, differenceInCalendarDays,
  addDays, subDays, format, parseISO, isValid, isToday, isSameDay } = require('date-fns');

/**
 * Get date range for a given period
 */
const getDateRange = (period, date = new Date()) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  switch (period) {
    case 'today':
      return { start: startOfDay(d), end: endOfDay(d) };
    case 'week':
      return { start: startOfWeek(d, { weekStartsOn: 1 }), end: endOfWeek(d, { weekStartsOn: 1 }) };
    case 'month':
      return { start: startOfMonth(d), end: endOfMonth(d) };
    case 'year':
      return { start: startOfYear(d), end: endOfYear(d) };
    default:
      return { start: startOfDay(d), end: endOfDay(d) };
  }
};

/**
 * Calculate streak from an array of completion dates
 */
const calculateStreak = (completionDates, frequency = 'daily') => {
  if (!completionDates || completionDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  const sorted = [...completionDates]
    .map(d => startOfDay(new Date(d)))
    .sort((a, b) => b - a); // descending

  const unique = sorted.filter((date, i, arr) =>
    i === 0 || !isSameDay(date, arr[i - 1])
  );

  // Check if today or yesterday is in the list
  const today = startOfDay(new Date());
  const lastEntry = unique[0];
  const daysSinceLastEntry = differenceInCalendarDays(today, lastEntry);

  // If last completion was more than 1 day ago, streak is broken
  if (daysSinceLastEntry > 1) {
    return { current: 0, longest: calculateLongestStreak(unique) };
  }

  // Calculate current streak
  let currentStreak = 1;
  for (let i = 1; i < unique.length; i++) {
    const diff = differenceInCalendarDays(unique[i - 1], unique[i]);
    if (diff === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    current: currentStreak,
    longest: Math.max(currentStreak, calculateLongestStreak(unique)),
  };
};

const calculateLongestStreak = (sortedDescDates) => {
  if (sortedDescDates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sortedDescDates.length; i++) {
    const diff = differenceInCalendarDays(sortedDescDates[i - 1], sortedDescDates[i]);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
};

/**
 * Get week days starting from Monday
 */
const getWeekDays = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

/**
 * Format a date for display
 */
const formatDate = (date, fmt = 'yyyy-MM-dd') => {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, fmt) : null;
};

/**
 * Check if a task/habit is overdue
 */
const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date() && !isToday(new Date(dueDate));
};

/**
 * Build heatmap data from completion dates
 */
const buildHeatmapData = (completionDates, year = new Date().getFullYear()) => {
  const map = new Map();
  completionDates.forEach(date => {
    const key = formatDate(date);
    map.set(key, (map.get(key) || 0) + 1);
  });

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const result = [];

  let current = startOfDay(startDate);
  while (current <= endDate) {
    const key = formatDate(current);
    result.push({ date: key, count: map.get(key) || 0 });
    current = addDays(current, 1);
  }

  return result;
};

module.exports = {
  getDateRange,
  calculateStreak,
  calculateLongestStreak,
  getWeekDays,
  formatDate,
  isOverdue,
  buildHeatmapData,
  startOfDay,
  endOfDay,
  differenceInCalendarDays,
  isSameDay,
  addDays,
  subDays,
  isToday,
};
