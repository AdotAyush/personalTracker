# StreakMate – Habit Tracker & Personal Management App  
## Complete Project Plan + Architecture + Copilot Prompt

---

# 1. Project Overview

**App Name:** StreakMate  
**Platform:** Android (Native)  
**Tech Stack:** Kotlin + Jetpack Compose  
**Architecture:** MVVM + Clean Architecture  
**Storage:** Room (Offline-first)  
**Cloud:** Supabase (Postgres) OR Firebase (Firestore)  
**Auth:** Email/Password + Google OAuth  
**Background Tasks:** WorkManager  
**Reminders:** NotificationManager + AlarmManager (only when exact timing required)  
**Deployment:** Android App Bundle (AAB) via Play Console  

This app will:

- Track habits
- Maintain streaks
- Display calendar heatmaps
- Manage important dates
- Store data per logged-in user
- Work offline with background sync
- Provide analytics & performance metrics

---

# 2. Functional Requirements

## 2.1 Authentication
- Email + password login
- Google OAuth
- Secure session management
- User-scoped data storage
- Logout + account deletion
- Password reset flow

---

## 2.2 Habit Management
- Create habit
  - Title
  - Description
  - Color/icon
  - Priority
  - Tags
  - Recurrence rule (daily / weekly / custom)
  - Reminder time
- Edit habit
- Delete habit
- Pause habit (streak freeze)
- Archive habit

---

## 2.3 Streak System
- Consecutive-day streak tracking
- Longest streak record
- Completion rate %
- Grace tolerance (optional missed day logic)
- Timezone-aware streak calculation

---

## 2.4 Habit Logging
- Mark complete
- Add note
- Optional image attachment
- Undo action
- Multiple logs per day (if enabled)

---

## 2.5 Calendar System
- Month view
- Heatmap visualization
- Day view breakdown
- Tap date → see logs
- Highlight missed days
- Show important events

---

## 2.6 Important Dates
- Add important date
- Recurring annual events
- Reminder configuration
- Calendar integration

---

## 2.7 Notifications
- Scheduled reminders
- Snooze option
- Mark complete from notification
- Persistent reminder until dismissed
- Reboot-safe scheduling

---

## 2.8 Analytics
- Weekly completion %
- Monthly performance
- Streak history graph
- Habit comparison view
- Productivity summary

---

## 2.9 Offline Support
- Full functionality offline
- Change queue
- Background sync when online
- Conflict resolution (last-write-wins)

---

## 2.10 Data Controls
- Export data (JSON / CSV)
- Import data
- Delete account
- Backup toggle

---

# 3. Non-Functional Requirements

## Performance
- Query optimization with indexed fields
- Lazy loading calendar tiles
- Coroutine-based async handling

## Security
- HTTPS only
- Encrypted local DB (optional SQLCipher)
- Secure token storage (EncryptedSharedPreferences)

## Reliability
- WorkManager retry policies
- Graceful network failure handling
- Crash reporting integration

## Battery Optimization
- Inexact alarms preferred
- WorkManager for periodic jobs
- Avoid wake locks

## Scalability
- Pagination in cloud queries
- Indexed userId + date queries

## Accessibility
- Screen reader support
- Adjustable font scaling
- High contrast mode

---

# 4. UI/UX Requirements

## Screens

### 1. Onboarding
- Minimal steps
- Clean typography
- Benefits summary

### 2. Login / Signup
- Email
- Password
- Google login
- Forgot password

### 3. Home (Today View)
- Today’s habits
- Streak snapshot
- Quick mark-done
- Add habit button
- Undo snackbars

### 4. Calendar
- Month heatmap
- Color-coded days
- Tap → open day detail
- Toggle list view

### 5. Create/Edit Habit
- Recurrence builder UI
- Reminder picker
- Icon & color selector

### 6. Habit Detail
- History
- Longest streak
- Completion %
- Edit/delete

### 7. Analytics
- Charts (weekly/monthly)
- Progress comparison
- Streak milestones

### 8. Settings
- Dark mode
- Notifications toggle
- Backup toggle
- Data export/import
- Delete account

---

# 5. Data Model Design

## User
- id: UUID
- email
- displayName
- timezone
- createdAt

## Habit
- id
- userId (FK)
- title
- description
- color
- icon
- scheduleJson
- reminderJson
- isActive
- pausedUntil
- createdAt
- updatedAt

## HabitLog
- id
- habitId
- userId
- date
- completed
- notes
- createdAt
- updatedAt

## ImportantDate
- id
- userId
- date
- title
- recurring (boolean)
- reminderTime

## ChangeQueue
- id
- entityType
- entityId
- operationType
- payloadJson
- createdAt

Indexes:
- (userId, date)
- (habitId, date)

---

# 6. Architecture

## Client Architecture

UI Layer:
- Jetpack Compose
- ViewModel
- StateFlow

Domain Layer:
- UseCases
- Repository interfaces

Data Layer:
- Room
- Retrofit/Ktor
- SyncManager

Dependency Injection:
- Hilt

---

## Background System

WorkManager:
- Periodic sync worker
- Retry on failure
- Network constraint only

AlarmManager:
- Exact reminders only if required

NotificationManager:
- Actionable notifications

---

# 7. Streak Algorithm

Pseudo-logic:

1. Normalize dates to user timezone
2. Fetch logs sorted descending
3. Start from today
4. Iterate backward
5. Break on first missing day
6. Count continuous completions

Optional:
- Allow 1 grace skip

---

# 8. Sync Strategy

1. Local change recorded in ChangeQueue
2. WorkManager triggers sync
3. Batch send changes
4. Server resolves conflicts
5. Clear successful queue entries

Conflict resolution:
- Compare updatedAt timestamps
- Latest update wins

---

# 9. Implementation Phases

## Phase 0 – Setup
- Kotlin project
- Hilt config
- Room schema
- Auth integration

## Phase 1 – Core Features
- Habit CRUD
- Logging
- Home screen
- Local streak logic

## Phase 2 – Calendar + Reminders
- Heatmap view
- Notification scheduling
- Background tasks

## Phase 3 – Cloud Sync
- Sync engine
- Conflict handling
- Offline recovery

## Phase 4 – Analytics & Polish
- Charts
- Animations
- Accessibility
- Crash reporting

## Phase 5 – Release
- Release build
- AAB signing
- Play Console upload

---

# 10. Deployment Guide

## Local Testing
- Enable USB debugging
- `adb install app-debug.apk`

## Internal Testing
- Generate signed AAB
- Upload to Play Console internal track
- Add tester emails

## Production
- Play App Signing enabled
- Release AAB upload
- Publish staged rollout

---

# 11. CI/CD Plan

- GitHub Actions
- Run:
  - ktlint
  - detekt
  - unit tests
  - assembleDebug
- Auto-generate AAB on release branch

---

# 12. Optional Advanced Features (Future)

- AI-based habit insights
- Habit difficulty scoring
- Gamification (XP system)
- Social accountability groups
- Wear OS integration
- Widget support
- End-to-end encryption

---

# End of Document