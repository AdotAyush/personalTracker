const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase().padEnd(7)}: ${stack || message}${metaStr}`;
  })
);

const colorizedFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  logFormat
);

// Transport: rotating file for all logs
const fileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
  format: winston.format.combine(winston.format.uncolorize(), logFormat),
});

// Transport: rotating file for errors only
const errorFileTransport = new DailyRotateFile({
  filename: path.join(LOG_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: winston.format.combine(winston.format.uncolorize(), logFormat),
});

const transports = [
  new winston.transports.Console({
    level: LOG_LEVEL,
    format: colorizedFormat,
    silent: process.env.NODE_ENV === 'test',
  }),
  fileTransport,
  errorFileTransport,
];

const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports,
  exitOnError: false,
});

// Stream interface for Morgan
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
