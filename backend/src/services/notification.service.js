const webpush = require('web-push');
const User = require('../models/User.model');
const logger = require('../utils/logger');

class NotificationService {
  initialize() {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      logger.warn('VAPID keys not configured, push notifications disabled');
      return;
    }
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    logger.info('Push notification service initialized');
  }

  async subscribe(userId, subscription) {
    await User.findByIdAndUpdate(userId, {
      $push: { pushSubscriptions: subscription },
    });
  }

  async unsubscribe(userId, endpoint) {
    await User.findByIdAndUpdate(userId, {
      $pull: { pushSubscriptions: { endpoint } },
    });
  }

  async sendToUser(userId, payload) {
    const user = await User.findById(userId).select('pushSubscriptions preferences');
    if (!user?.preferences?.notifications?.push) return;
    if (!user.pushSubscriptions?.length) return;

    const notification = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: payload.tag || 'default',
      data: payload.data || {},
      actions: payload.actions || [],
    });

    const results = await Promise.allSettled(
      user.pushSubscriptions.map(sub =>
        webpush.sendNotification(sub, notification)
      )
    );

    // Remove invalid subscriptions
    const invalidEndpoints = [];
    results.forEach((result, i) => {
      if (result.status === 'rejected' && [404, 410].includes(result.reason?.statusCode)) {
        invalidEndpoints.push(user.pushSubscriptions[i].endpoint);
      }
    });

    if (invalidEndpoints.length) {
      await User.findByIdAndUpdate(userId, {
        $pull: { pushSubscriptions: { endpoint: { $in: invalidEndpoints } } },
      });
    }
  }

  async sendTaskReminder(userId, task) {
    return this.sendToUser(userId, {
      title: '⏰ Task Reminder',
      body: `"${task.title}" is due soon!`,
      tag: `task-${task._id}`,
      data: { type: 'task', taskId: task._id, url: '/tasks' },
      actions: [{ action: 'open', title: 'Open Task' }],
    });
  }

  async sendHabitReminder(userId, habit) {
    return this.sendToUser(userId, {
      title: `${habit.icon} Habit Reminder`,
      body: `Don't forget: "${habit.title}"`,
      tag: `habit-${habit._id}`,
      data: { type: 'habit', habitId: habit._id, url: '/habits' },
      actions: [
        { action: 'complete', title: '✅ Mark Done' },
        { action: 'open', title: 'Open' },
      ],
    });
  }

  async sendStreakAlert(userId, habit) {
    return this.sendToUser(userId, {
      title: '🔥 Streak Alert!',
      body: `Your "${habit.title}" streak is at risk! Complete it before midnight.`,
      tag: `streak-${habit._id}`,
      data: { type: 'streak', habitId: habit._id, url: '/habits' },
    });
  }
}

const notificationService = new NotificationService();

const initializePushNotifications = () => notificationService.initialize();

module.exports = { NotificationService: notificationService, initializePushNotifications };
