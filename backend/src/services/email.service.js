const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.from = process.env.EMAIL_FROM || 'PersonalTracker <noreply@personaltracker.app>';
  }

  getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  async sendMail({ to, subject, html, text }) {
    if (!process.env.SMTP_HOST) {
      logger.warn('SMTP not configured, skipping email send');
      return;
    }
    try {
      const info = await this.getTransporter().sendMail({
        from: this.from, to, subject, html, text,
      });
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Email send failed to ${to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(email, name, token) {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    return this.sendMail({
      to: email,
      subject: 'Verify your PersonalTracker email',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#6366f1">Welcome to PersonalTracker, ${name}!</h2>
          <p>Please verify your email address by clicking the button below.</p>
          <a href="${url}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">
            Verify Email
          </a>
          <p style="color:#666">This link expires in 24 hours.</p>
          <p style="color:#999;font-size:12px">If you didn't create this account, you can ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email, name, token) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    return this.sendMail({
      to: email,
      subject: 'Reset your PersonalTracker password',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#6366f1">Password Reset Request</h2>
          <p>Hi ${name}, we received a request to reset your password.</p>
          <a href="${url}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">
            Reset Password
          </a>
          <p style="color:#666">This link expires in 1 hour.</p>
          <p style="color:#999;font-size:12px">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordChangedEmail(email, name) {
    return this.sendMail({
      to: email,
      subject: 'Your PersonalTracker password was changed',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#6366f1">Password Changed</h2>
          <p>Hi ${name}, your password was successfully changed.</p>
          <p style="color:#e11d48">If you didn't make this change, please contact support immediately and reset your password.</p>
        </div>
      `,
    });
  }

  async sendWeeklyReport(email, name, stats) {
    return this.sendMail({
      to: email,
      subject: `Your Weekly Productivity Report 📊`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#6366f1">Weekly Report for ${name}</h2>
          <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:16px 0">
            <h3>This Week's Stats</h3>
            <p>✅ Tasks Completed: <strong>${stats.tasksCompleted}</strong></p>
            <p>🔥 Best Habit Streak: <strong>${stats.bestStreak} days</strong></p>
            <p>⏰ Pomodoro Sessions: <strong>${stats.pomodoroSessions}</strong></p>
            <p>📈 Productivity Score: <strong>${stats.productivityScore}/100</strong></p>
          </div>
          <a href="${process.env.FRONTEND_URL}/analytics" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
            View Full Report
          </a>
        </div>
      `,
    });
  }
}

module.exports = { EmailService: new EmailService() };
