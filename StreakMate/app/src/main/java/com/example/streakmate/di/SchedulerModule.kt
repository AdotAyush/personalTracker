package com.example.streakmate.di

import com.example.streakmate.data.reminder.AndroidReminderScheduler
import com.example.streakmate.domain.reminder.ReminderScheduler
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
abstract class SchedulerModule {

    @Binds
    abstract fun bindReminderScheduler(
        androidReminderScheduler: AndroidReminderScheduler
    ): ReminderScheduler
}
