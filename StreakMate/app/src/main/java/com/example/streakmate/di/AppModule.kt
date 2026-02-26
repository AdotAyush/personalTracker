package com.example.streakmate.di

import android.content.Context
import androidx.room.Room
import com.example.streakmate.data.local.StreakMateDatabase
import com.example.streakmate.data.local.dao.HabitDao
import com.example.streakmate.data.local.dao.UserDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): StreakMateDatabase {
        return Room.databaseBuilder(
            context,
            StreakMateDatabase::class.java,
            "streakmate.db"
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    @Singleton
    fun provideHabitDao(database: StreakMateDatabase): HabitDao = database.habitDao()

    @Provides
    @Singleton
    fun provideUserDao(database: StreakMateDatabase): UserDao = database.userDao()
}
