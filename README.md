# 🚀 PersonalTracker — Production-Ready Productivity System

> A full-stack MERN SaaS-grade personal productivity system with task management, habit tracking, time tables, analytics, Pomodoro timer, push notifications, and a PWA.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Scalability Roadmap](#scalability-roadmap)
- [Monetization Strategy](#monetization-strategy)

---

## ✨ Features

| Feature | Details |
|---|---|
| **Task Management** | Kanban board (DnD), list view, subtasks, priorities, tags, recurrence |
| **Habit Tracking** | Daily streaks, GitHub-style heatmaps, measurable targets (e.g. "drink 8 glasses") |
| **Time Table Builder** | Notion-style dynamic tables with 8 column types (text, number, date, select, tags…) |
| **Calendar** | Monthly view with event creation, color coding, date-range queries |
| **Analytics** | Productivity score, 7-day trend charts, priority distribution, Pomodoro stats |
| **Pomodoro Timer** | Floating draggable widget, 3 phases (work/short/long), Web Audio sounds, document title countdown |
| **Command Palette** | ⌘K fuzzy search across tasks, habits, and navigation (like VS Code) |
| **Push Notifications** | Web Push (VAPID), task/habit reminders, streak alerts |
| **PWA** | Installable, offline-capable, home screen icon, shortcuts |
| **Auth** | JWT access + refresh tokens with rotation & reuse detection, Google OAuth 2.0 |
| **Keyboard Shortcuts** | 1–6 navigation, ⌘K palette, P Pomodoro, F focus mode, Esc close |

---

## 🏗 Architecture

```
                          ┌─────────────────────┐
                          │      Nginx           │
                          │  (SSL termination,   │
                          │   rate limiting,     │
                          │   reverse proxy)     │
                          └────────┬─────────────┘
                    ┌─────────────┴──────────────┐
                    ▼                            ▼
          ┌─────────────────┐         ┌──────────────────┐
          │  React SPA/PWA  │         │  Express REST API  │
          │  (Vite + RTK +  │         │  (MVC pattern,    │
          │   React Query)  │         │   Passport JWT,   │
          └─────────────────┘         │   Joi validation) │
                                      └────────┬──────────┘
                                               │
                                      ┌────────▼──────────┐
                                      │     MongoDB        │
                                      │  (Mongoose ODM,   │
                                      │   indexes, TTL,   │
                                      │   text search)    │
                                      └───────────────────┘
```

### Backend Layer Breakdown

```
Request → Nginx → Express
  → Logger Middleware (requestId, timing)
  → Rate Limiter (global 300/15min, auth 10/15min)
  → Helmet (CSP, HSTS headers)
  → CORS (origin whitelist from env)
  → Body Parser + Mongo Sanitize
  → Route (auth/task/habit/timetable/calendar/analytics/user)
    → Validation Middleware (Joi schema)
    → Auth Middleware (Passport JWT)
    → Controller
      → Service (business logic)
        → Mongoose Model
      → Response Utils (standardized envelope)
  → Error Middleware (centralized, maps Mongoose/JWT errors)
```

### Frontend Data Flow

```
User Action
  → Redux slice (UI/optimistic state)
  → TanStack Query mutation
  → Axios (attaches Bearer token via interceptor)
  → API → Response
  → Query cache invalidation
  → React re-render
```

---

## 🛠 Tech Stack

### Backend
| Tech | Purpose |
|---|---|
| Node.js 20 + Express 4 | HTTP server & routing |
| MongoDB 7 + Mongoose 8 | Database & ODM |
| Passport.js (JWT + Google) | Authentication |
| bcryptjs | Password hashing |
| jsonwebtoken | Token generation/verification |
| Joi | Request validation |
| Helmet | Security headers |
| express-rate-limit | API rate limiting |
| Winston + daily-rotate-file | Structured logging |
| web-push | Web Push (VAPID) notifications |
| Nodemailer | Transactional email |
| swagger-jsdoc + swagger-ui-express | OpenAPI 3.0 docs |
| node-cron | Scheduled jobs |

### Frontend
| Tech | Purpose |
|---|---|
| React 18 | UI library |
| Vite 5 | Build tool |
| Redux Toolkit 2 | Global UI & auth state |
| TanStack Query v5 | Server state & caching |
| TailwindCSS 3.4 | Utility-first styling |
| Framer Motion 10 | Animations |
| DnD Kit 6 | Drag-and-drop Kanban |
| Recharts 2 | Data visualization |
| React Router 6 | Client-side routing |
| react-calendar-heatmap | GitHub-style heatmap |
| vite-plugin-pwa | Service worker & PWA manifest |
| lucide-react | Icon library |

---

## 📁 Project Structure

```
personalTrackerApp/
├── backend/
│   ├── server.js                    # Entry point, graceful shutdown
│   ├── src/
│   │   ├── app.js                   # Express app factory
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   ├── passport.js          # JWT + Google OAuth strategies
│   │   │   └── swagger.js           # OpenAPI spec
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── Task.model.js
│   │   │   ├── Habit.model.js
│   │   │   ├── TimeTable.model.js
│   │   │   ├── CalendarEvent.model.js
│   │   │   └── ActivityLog.model.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── rateLimiter.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   └── logger.middleware.js
│   │   ├── validations/
│   │   │   ├── auth.validation.js
│   │   │   ├── task.validation.js
│   │   │   └── habit.validation.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── task.service.js
│   │   │   ├── habit.service.js
│   │   │   ├── email.service.js
│   │   │   ├── notification.service.js
│   │   │   └── analytics.service.js
│   │   ├── controllers/             # auth, task, habit, timetable, calendar, analytics, user
│   │   ├── routes/                  # Matching route files
│   │   └── utils/
│   │       ├── logger.js
│   │       ├── jwt.utils.js
│   │       ├── response.utils.js
│   │       └── date.utils.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/                   # Dashboard, Tasks, Habits, TimeTable, Calendar, Analytics, Settings, Login, Register, ForgotPassword
│   │   ├── components/
│   │   │   ├── layout/              # Layout, Sidebar, Header
│   │   │   ├── common/              # ErrorBoundary, LoadingScreen, Skeleton, Modal
│   │   │   └── features/
│   │   │       ├── tasks/           # KanbanBoard, TaskCard, TaskForm, TaskList
│   │   │       ├── habits/          # HabitCard, HabitTracker, HeatmapCalendar
│   │   │       ├── pomodoro/        # PomodoroWidget
│   │   │       ├── command-palette/ # CommandPalette
│   │   │       └── timetable/       # TimeTableBuilder
│   │   ├── hooks/                   # useAuth, useTheme, useKeyboardShortcuts, usePomodoro
│   │   ├── services/                # api.js (Axios), index.js (all service fns)
│   │   └── store/                   # Redux store + slices (auth, ui, tasks, habits)
│   └── Dockerfile
├── nginx/
│   └── nginx.conf                   # Production reverse proxy
├── .github/
│   └── workflows/
│       └── ci.yml                   # Lint → Test → Build → Docker push → Deploy
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+ (local) or MongoDB Atlas URI
- npm or yarn

### 1. Clone & install

```bash
git clone https://github.com/your-org/personaltracker.git
cd personaltracker

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# backend/.env
cp backend/.env.example backend/.env
# Edit values (MongoDB URI, JWT secrets, SMTP, VAPID, Google OAuth)

# frontend/.env
echo "VITE_API_URL=http://localhost:5000" > frontend/.env
```

### 3. Generate VAPID keys (for push notifications)

```bash
    npx web-push generate-vapid-keys
# Copy the output into backend/.env as VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
```

### 4. Start development servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

App: http://localhost:5173  
API: http://localhost:5000  
Swagger: http://localhost:5000/api/docs

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/personaltracker

# JWT (generate with: openssl rand -base64 64)
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app-password
FROM_EMAIL=noreply@yourapp.com

# Web Push (npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:admin@yourapp.com

# App
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 📖 API Documentation

Interactive Swagger UI: `/api/docs`

### Auth Endpoints
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login + token pair |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Revoke refresh token |
| GET  | `/api/v1/auth/me` | Current user |
| POST | `/api/v1/auth/forgot-password` | Send reset email |
| POST | `/api/v1/auth/reset-password` | Reset with token |
| GET  | `/api/v1/auth/google` | Google OAuth redirect |

### Resource Endpoints (all protected)
- `/api/v1/tasks` — CRUD, kanban, reorder, subtasks
- `/api/v1/habits` — CRUD, completions, heatmap, stats
- `/api/v1/timetables` — CRUD, columns, rows
- `/api/v1/calendar` — events CRUD
- `/api/v1/analytics` — dashboard, heatmap, pomodoro, trend
- `/api/v1/user` — profile, preferences, push subscriptions

---

## 🐳 Deployment

### Docker Compose (recommended)

```bash
# 1. Copy env template
cp .env.example .env && nano .env

# 2. Add SSL certs (Let's Encrypt or self-signed)
mkdir -p nginx/certs
# Place fullchain.pem and privkey.pem in nginx/certs/

# 3. Start all services
docker compose up -d

# View logs
docker compose logs -f backend
```

### Manual VPS Deployment

```bash
# Install Node 20, MongoDB 7, Nginx
# Build frontend
cd frontend && npm run build

# PM2 for backend
npm install -g pm2
cd backend && pm2 start server.js --name pt-backend

# Nginx: serve frontend/dist as static, proxy /api/ to :5000
```

### Environment Secrets (CI/CD)

Set these GitHub Actions secrets:
- `DEPLOY_HOST` — your server IP/hostname
- `DEPLOY_USER` — SSH username
- `DEPLOY_SSH_KEY` — private key for SSH

---

## 📈 Scalability Roadmap

### Phase 1 — Current (Single Server)
- Vertical scaling: increase server resources
- MongoDB indexes on all query fields ✅
- Connection pooling (maxPoolSize=10) ✅
- Rate limiting per IP ✅
- Response compression ✅

### Phase 2 — Horizontal Scaling
```
Load Balancer (HAProxy / AWS ALB)
├── App Server 1 (Node.js)
├── App Server 2 (Node.js)
└── App Server 3 (Node.js)
         │
    Redis Cluster (session storage, rate limiting, pub/sub)
         │
    MongoDB Atlas (replica set, read replicas)
```

**Changes needed:**
- Switch from `express-rate-limit` memory store → Redis store (`rate-limit-redis`)
- Move refresh tokens to Redis (faster, auto-TTL)
- Add Redis pub/sub for real-time task updates (Socket.io)

### Phase 3 — Microservices (10k+ users)
| Service | Responsibility |
|---|---|
| auth-service | JWT, OAuth, sessions |
| task-service | Tasks + Kanban |
| habit-service | Habits + streaks |
| notification-service | Push + email |
| analytics-service | Aggregations |
| gateway | Nginx + Kong API Gateway |

**Infrastructure:** Kubernetes (EKS/GKE), Helm charts, Horizontal Pod Autoscaler

### Phase 4 — CDN & Performance
- Serve frontend via CloudFront / Vercel
- Image optimization pipeline (Sharp)
- Database query caching (Redis + cache-aside pattern)
- Elasticsearch for full-text task/habit search at scale

---

## 💰 Monetization Strategy

### Tier 1 — Free
- Up to 3 habit trackers
- Up to 50 tasks total
- 1 time table
- Basic analytics (7 days)
- No push notifications

### Tier 2 — Pro ($8/month or $72/year)
- Unlimited habits, tasks, time tables
- Full analytics (90 days + heatmaps)
- Push notifications (all types)
- Google Calendar sync
- Data export (JSON/CSV)
- Pomodoro stats history

### Tier 3 — Team ($20/user/month)
- Everything in Pro
- Shared time tables with real-time collaboration
- Task assignment & mentions
- Team analytics dashboard
- Admin panel (user management)
- SSO (SAML/Google Workspace)
- Priority support

### Additional Revenue Streams
1. **API Access** ($49/mo) — Developers building on top of the productivity data
2. **Lifetime Deal** ($199 one-time) — Popular on AppSumo for indie SaaS
3. **White Label** ($500+/mo) — License the codebase to HR/wellness companies
4. **Coaching Integration** — Marketplace for productivity coaches using your analytics data

### Implementation Notes
- Use Stripe for subscriptions (`stripe`, `@stripe/stripe-js`)
- Feature flags via `unleash` or simple Redis-backed flag service
- Enforce limits in service layer with plan checks on authenticated user's `plan` field

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/awesome-feature`
3. Commit changes: `git commit -m 'feat: add awesome feature'`
4. Push: `git push origin feature/awesome-feature`
5. Open a Pull Request

---

## 📄 License

MIT © PersonalTracker
