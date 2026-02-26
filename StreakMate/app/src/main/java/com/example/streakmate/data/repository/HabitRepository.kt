package com.example.streakmate.data.repository

import com.example.streakmate.data.local.dao.HabitDao
import com.example.streakmate.data.local.entity.HabitEntity
import com.example.streakmate.data.local.entity.HabitLogEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

interface HabitRepository {
    fun getActiveHabits(userId: String): Flow<List<HabitEntity>>
    suspend fun getHabit(id: Long): HabitEntity?
    fun getLogsForDate(date: Long): Flow<List<HabitLogEntity>>
    suspend fun createHabit(habit: HabitEntity): Long
    suspend fun updateHabit(habit: HabitEntity)
    suspend fun deleteHabit(habit: HabitEntity)
    fun getHabitLogs(habitId: Long): Flow<List<HabitLogEntity>>
    suspend fun logHabit(habitId: Long, date: Long, note: String? = null)
    suspend fun removeLog(habitId: Long, date: Long)
    suspend fun getHabitLog(habitId: Long, date: Long): HabitLogEntity?
}

@Singleton
class HabitRepositoryImpl @Inject constructor(
    private val habitDao: HabitDao
) : HabitRepository {
    override fun getActiveHabits(userId: String): Flow<List<HabitEntity>> {
        return habitDao.getActiveHabits(userId)
    }

    override suspend fun getHabit(id: Long): HabitEntity? {
        return habitDao.getHabit(id)
    }

    override fun getLogsForDate(date: Long): Flow<List<HabitLogEntity>> {
        return habitDao.getLogsForDate(date)
    }

    override suspend fun createHabit(habit: HabitEntity): Long {
        return habitDao.insertHabit(habit)
    }

    override suspend fun updateHabit(habit: HabitEntity) {
        habitDao.updateHabit(habit)
    }

    override suspend fun deleteHabit(habit: HabitEntity) {
        habitDao.deleteHabit(habit)
    }

    override fun getHabitLogs(habitId: Long): Flow<List<HabitLogEntity>> {
        return habitDao.getHabitLogs(habitId)
    }

    override suspend fun logHabit(habitId: Long, date: Long, note: String?) {
        val log = HabitLogEntity(
            habitId = habitId,
            date = date,
            note = note
        )
        habitDao.insertLog(log)
    }

    override suspend fun removeLog(habitId: Long, date: Long) {
        habitDao.deleteHabitLog(habitId, date)
    }
    
    override suspend fun getHabitLog(habitId: Long, date: Long): HabitLogEntity? {
        return habitDao.getHabitLog(habitId, date)
    }
}
