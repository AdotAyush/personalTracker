package com.example.streakmate.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.streakmate.data.local.dao.HabitDao
import com.example.streakmate.data.local.dao.UserDao
import com.example.streakmate.data.local.entity.ChangeQueueEntity
import com.example.streakmate.data.local.entity.HabitEntity
import com.example.streakmate.data.local.entity.HabitLogEntity
import com.example.streakmate.data.local.entity.ImportantDateEntity
import com.example.streakmate.data.local.entity.UserEntity

@Database(
    entities = [
        UserEntity::class,
        HabitEntity::class,
        HabitLogEntity::class,
        ImportantDateEntity::class,
        ChangeQueueEntity::class
    ],
    version = 1,
    exportSchema = true
)
abstract class StreakMateDatabase : RoomDatabase() {
    abstract fun habitDao(): HabitDao
    abstract fun userDao(): UserDao
}
