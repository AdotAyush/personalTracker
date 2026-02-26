# StreakMate - Native Android Habit Tracker

StreakMate is a modern habit tracking application built with **Kotlin** and **Jetpack Compose**. It uses **Room** for local persistence and **WorkManager** for background tasks.

## Tech Stack

- **UI**: Jetpack Compose (Material 3)
- **Architecture**: MVVM + Clean Architecture
- **Dependency Injection**: Hilt
- **Database**: Room
- **Async**: Coroutines + Flow
- **Background Work**: WorkManager
- **Navigation**: Compose Navigation

## Project Structure

- `data`: Database, Network, Repositories
- `domain`: Use cases, Domain models (Entities are currently in data/local/entity for simplicity)
- `di`: Hilt modules
- `ui`: Composable screens, ViewModels, Theme
  - `screens`: Feature-specific screens (Login, Home, Habit, Detail, Calendar)
- `worker`: WorkManager workers

## Build Instructions

1.  Open the project in **Android Studio Hedgehog** or newer.
2.  Sync Gradle files.
3.  Run the app on an emulator or device (API 26+ recommended).

### Command Line Build

To build the debug APK:
```bash
./gradlew assembleDebug
```

To build the Release Bundle (AAB):
```bash
./gradlew bundleRelease
```

## Features Implemented (Scaffolding)
- Login / User Auth (UI Shell)
- Habit Creation / Editing (UI Shell + DB Schema)
- Habit List (UI Shell + DB DAO)
- Habit Detail & Logging (UI Shell + DB Integration)
- Calendar Heatmap (UI Shell)
- Reminders (AlarmManager scaffolding)
- Sync (WorkManager scaffolding)

## Next Steps
- Implement `SyncManager` with actual Supabase / Firebase logic.
- Enhance Compose screens with proper state management and ViewModels.
- Add Unit Tests for Streak Logic.
