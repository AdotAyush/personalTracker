const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PersonalTracker API',
      version: '1.0.0',
      description: `
## Personal Productivity System API

A comprehensive REST API for managing tasks, habits, timetables, and productivity analytics.

### Features
- 🔐 JWT Authentication with refresh tokens
- ✅ Task management with Kanban support
- 🔥 Habit tracking with streak calculation
- 📅 Custom timetable builder
- 📊 Analytics and productivity insights
- 🍅 Pomodoro timer integration
      `,
      contact: {
        name: 'PersonalTracker Support',
        email: 'support@personaltracker.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://api.personaltracker.app/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT access token',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                pages: { type: 'integer' },
                limit: { type: 'integer' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & authorization' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Tasks', description: 'Task management & Kanban' },
      { name: 'Habits', description: 'Habit tracking & streaks' },
      { name: 'Timetable', description: 'Dynamic timetable builder' },
      { name: 'Calendar', description: 'Calendar events & scheduling' },
      { name: 'Analytics', description: 'Productivity analytics & insights' },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
