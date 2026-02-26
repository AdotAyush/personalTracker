package com.example.streakmate.ui.screens.detail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.streakmate.data.local.entity.HabitEntity
import com.example.streakmate.data.local.entity.HabitLogEntity
import com.example.streakmate.data.repository.HabitRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

@HiltViewModel
class HabitDetailViewModel @Inject constructor(
    private val repository: HabitRepository
) : ViewModel() {

    private val _habit = MutableStateFlow<HabitEntity?>(null)
    val habit = _habit.asStateFlow()

    private val _recentLogs = MutableStateFlow<List<HabitLogEntity>>(emptyList())
    val recentLogs = _recentLogs.asStateFlow()

    private val _currentStreak = MutableStateFlow(0)
    val currentStreak = _currentStreak.asStateFlow()

    private val _longestStreak = MutableStateFlow(0)
    val longestStreak = _longestStreak.asStateFlow()

    private val _totalCompletions = MutableStateFlow(0)
    val totalCompletions = _totalCompletions.asStateFlow()

    private val _completionRate = MutableStateFlow(0f)
    val completionRate = _completionRate.asStateFlow()

    fun initialize(habitId: Long) {
        viewModelScope.launch {
            val habit = repository.getHabit(habitId)
            _habit.value = habit

            if (habit != null) {
                _totalCompletions.value = repository.getTotalCompletions(habitId)

                // Calculate completion rate (last 30 days)
                val today = LocalDate.now()
                val thirtyDaysAgo = today.minusDays(30)
                repository.getHabitLogsForRange(
                    habitId,
                    thirtyDaysAgo.toEpochDay(),
                    today.toEpochDay()
                ).collect { logs ->
                    val completedDays = logs.distinctBy { it.date }.size
                    _completionRate.value = completedDays.toFloat() / 30f

                    // Compute streaks
                    val sortedDates = logs.map { it.date }.distinct().sortedDescending()
                    _currentStreak.value = computeCurrentStreak(sortedDates)
                    _longestStreak.value = computeLongestStreak(
                        logs.map { it.date }.distinct().sorted()
                    )
                }
            }
        }

        viewModelScope.launch {
            repository.getRecentHabitLogs(habitId, 10).collect {
                _recentLogs.value = it
            }
        }
    }

    private fun computeCurrentStreak(sortedDatesDescending: List<Long>): Int {
        if (sortedDatesDescending.isEmpty()) return 0
        var streak = 0
        var expectedDay = LocalDate.now().toEpochDay()
        
        // Allow today to not be completed yet
        if (sortedDatesDescending.isNotEmpty() && sortedDatesDescending[0] != expectedDay) {
            expectedDay = LocalDate.now().minusDays(1).toEpochDay()
        }
        
        for (date in sortedDatesDescending) {
            if (date == expectedDay) {
                streak++
                expectedDay--
            } else if (date < expectedDay) {
                break
            }
        }
        return streak
    }

    private fun computeLongestStreak(sortedDatesAscending: List<Long>): Int {
        if (sortedDatesAscending.isEmpty()) return 0
        var longest = 1
        var current = 1

        for (i in 1 until sortedDatesAscending.size) {
            if (sortedDatesAscending[i] == sortedDatesAscending[i - 1] + 1) {
                current++
                longest = maxOf(longest, current)
            } else {
                current = 1
            }
        }
        return longest
    }

    fun deleteHabit(onDeleted: () -> Unit) {
        val h = _habit.value ?: return
        viewModelScope.launch {
            repository.deleteHabit(h)
            onDeleted()
        }
    }
}
