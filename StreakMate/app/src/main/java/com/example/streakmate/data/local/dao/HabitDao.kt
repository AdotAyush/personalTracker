package com.example.streakmate.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.streakmate.data.local.entity.HabitEntity
import com.example.streakmate.data.local.entity.HabitLogEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface HabitDao {
    @Query("SELECT * FROM habits WHERE userId = :userId AND archived = 0 ORDER BY priority DESC")
    fun getActiveHabits(userId: String): Flow<List<HabitEntity>>

    @Query("SELECT * FROM habits WHERE id = :id")
    suspend fun getHabit(id: Long): HabitEntity?

    @Query("SELECT * FROM habit_logs WHERE date = :date")
    fun getLogsForDate(date: Long): Flow<List<HabitLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHabit(habit: HabitEntity): Long

    @Update
    suspend fun updateHabit(habit: HabitEntity)

    @Delete
    suspend fun deleteHabit(habit: HabitEntity)

    @Query("SELECT * FROM habit_logs WHERE habitId = :habitId AND date = :date")
    suspend fun getHabitLog(habitId: Long, date: Long): HabitLogEntity?

    @Query("SELECT * FROM habit_logs WHERE habitId = :habitId ORDER BY date DESC")
    fun getHabitLogs(habitId: Long): Flow<List<HabitLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: HabitLogEntity): Long

    @Query("DELETE FROM habit_logs WHERE habitId = :habitId AND date = :date")
    suspend fun deleteHabitLog(habitId: Long, date: Long)
}
