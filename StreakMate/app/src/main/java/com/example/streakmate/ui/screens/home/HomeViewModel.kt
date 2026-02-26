package com.example.streakmate.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.streakmate.data.local.entity.HabitEntity
import com.example.streakmate.data.repository.HabitRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

data class HabitUiState(
    val habit: HabitEntity,
    val isCompletedToday: Boolean,
    val currentStreak: Int
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: HabitRepository
) : ViewModel() {

    private val userId = "user_1" // Mock
    private val _selectedDate = MutableStateFlow(LocalDate.now())

    private val _refreshTrigger = MutableStateFlow(0)

    @OptIn(ExperimentalCoroutinesApi::class)
    val uiState: StateFlow<List<HabitUiState>> = combine(
        _selectedDate,
        _refreshTrigger
    ) { date, _ -> date }
        .flatMapLatest { date ->
            combine(
                repository.getActiveHabits(userId),
                repository.getLogsForDate(date.toEpochDay())
            ) { habits, logs ->
                val completedHabitIds = logs.map { it.habitId }.toSet()

                habits.map { habit ->
                    HabitUiState(
                        habit = habit,
                        isCompletedToday = completedHabitIds.contains(habit.id),
                        currentStreak = 0 // Will compute below
                    )
                }
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    val completionProgress: StateFlow<Float> = uiState.map { habits ->
        if (habits.isEmpty()) 0f
        else habits.count { it.isCompletedToday }.toFloat() / habits.size
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0f)

    val completedCount: StateFlow<Int> = uiState.map { habits ->
        habits.count { it.isCompletedToday }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    fun toggleHabitCompletion(habitId: Long, isCompleted: Boolean) {
        viewModelScope.launch {
            val date = _selectedDate.value.toEpochDay()
            if (isCompleted) {
                repository.logHabit(habitId, date)
            } else {
                repository.removeLog(habitId, date)
            }
        }
    }

    fun deleteHabit(habitId: Long) {
        viewModelScope.launch {
            repository.deleteHabitById(habitId)
            _refreshTrigger.value++
        }
    }

    fun createSampleData() {
        viewModelScope.launch {
            repository.createHabit(
                HabitEntity(
                    userId = userId,
                    title = "Drink Water",
                    description = "Stay hydrated - 2L per day",
                    color = 0xFF42A5F5.toInt(),
                    iconName = "water",
                    recurrenceRule = "DAILY",
                    reminderTime = null,
                    tags = "health"
                )
            )
            repository.createHabit(
                HabitEntity(
                    userId = userId,
                    title = "Morning Run",
                    description = "5km jog before work",
                    color = 0xFFEF5350.toInt(),
                    iconName = "run",
                    recurrenceRule = "DAILY",
                    reminderTime = null,
                    tags = "fitness"
                )
            )
            repository.createHabit(
                HabitEntity(
                    userId = userId,
                    title = "Read Books",
                    description = "30 minutes of reading",
                    color = 0xFFFFCA28.toInt(),
                    iconName = "book",
                    recurrenceRule = "DAILY",
                    reminderTime = null,
                    tags = "mind"
                )
            )
            repository.createHabit(
                HabitEntity(
                    userId = userId,
                    title = "Meditate",
                    description = "10 minutes mindfulness",
                    color = 0xFF7E57C2.toInt(),
                    iconName = "meditation",
                    recurrenceRule = "DAILY",
                    reminderTime = null,
                    tags = "wellness"
                )
            )
        }
    }
}

