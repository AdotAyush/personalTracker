const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getDashboard, getHeatmap, getPomodoroStats, getSevenDayTrend, logPomodoroSession } = require('../controllers/analytics.controller');

router.use(authenticate);
router.get('/dashboard', getDashboard);
router.get('/heatmap', getHeatmap);
router.get('/pomodoro', getPomodoroStats);
router.get('/trend', getSevenDayTrend);
router.post('/pomodoro', logPomodoroSession);

module.exports = router;
