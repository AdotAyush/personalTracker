import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
};

export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  getKanbanTasks: () => api.get('/tasks/kanban'),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  getTasksInRange: (startDate, endDate) => api.get('/tasks/range', { params: { startDate, endDate } }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  reorderTasks: (tasks) => api.put('/tasks/reorder', { tasks }),
  addSubtask: (taskId, data) => api.post(`/tasks/${taskId}/subtasks`, data),
  toggleSubtask: (taskId, subtaskId) => api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`),
};

export const habitService = {
  getHabits: (params) => api.get('/habits', { params }),
  getTodaySummary: () => api.get('/habits/today'),
  getHabitById: (id) => api.get(`/habits/${id}`),
  getStats: () => api.get('/habits/stats'),
  createHabit: (data) => api.post('/habits', data),
  updateHabit: (id, data) => api.patch(`/habits/${id}`, data),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
  logCompletion: (id, data) => api.post(`/habits/${id}/complete`, data),
  removeCompletion: (id, date) => api.delete(`/habits/${id}/complete`, { data: { date } }),
  getHeatmap: (id, year) => api.get(`/habits/${id}/heatmap`, { params: { year } }),
};

export const timetableService = {
  getAll: (params) => api.get('/timetable', { params }),
  getTimetables: (params) => api.get('/timetable', { params }),
  getById: (id) => api.get(`/timetable/${id}`),
  getTimetableById: (id) => api.get(`/timetable/${id}`),
  create: (data) => api.post('/timetable', data),
  createTimetable: (data) => api.post('/timetable', data),
  update: (id, data) => api.patch(`/timetable/${id}`, data),
  updateTimetable: (id, data) => api.patch(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`),
  deleteTimetable: (id) => api.delete(`/timetable/${id}`),
  addColumn: (id, data) => api.post(`/timetable/${id}/columns`, data),
  updateColumn: (id, columnId, data) => api.put(`/timetable/${id}/columns/${columnId}`, data),
  deleteColumn: (id, columnId) => api.delete(`/timetable/${id}/columns/${columnId}`),
  reorderColumns: (id, columnIds) => api.put(`/timetable/${id}/columns/reorder`, { columnIds }),
  addRow: (id, data) => api.post(`/timetable/${id}/rows`, data),
  updateRow: (id, rowId, data) => api.put(`/timetable/${id}/rows/${rowId}`, data),
  deleteRow: (id, rowId) => api.delete(`/timetable/${id}/rows/${rowId}`),
};

export const calendarService = {
  getEvents: (params) => api.get('/calendar', { params }),
  createEvent: (data) => api.post('/calendar', data),
  updateEvent: (id, data) => api.patch(`/calendar/${id}`, data),
  deleteEvent: (id) => api.delete(`/calendar/${id}`),
};

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getHeatmap: (year) => api.get('/analytics/heatmap', { params: { year } }),
  getPomodoroStats: (period) => api.get('/analytics/pomodoro', { params: { period } }),
  getSevenDayTrend: () => api.get('/analytics/trend'),
  getTrend: () => api.get('/analytics/trend'),
  logPomodoro: (data) => api.post('/analytics/pomodoro', data),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  updatePreferences: (data) => api.patch('/users/preferences', data),
  changePassword: (data) => api.patch('/users/password', data),
  subscribePush: (sub) => api.post('/users/notifications/subscribe', sub),
  unsubscribePush: (endpoint) => api.post('/users/notifications/unsubscribe', { endpoint }),
  deleteAccount: (password) => api.delete('/users/account', { data: { password } }),
};
