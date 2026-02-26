package com.example.streakmate.di

import com.example.streakmate.data.repository.HabitRepository
import com.example.streakmate.data.repository.HabitRepositoryImpl
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindHabitRepository(
        habitRepositoryImpl: HabitRepositoryImpl
    ): HabitRepository
}
