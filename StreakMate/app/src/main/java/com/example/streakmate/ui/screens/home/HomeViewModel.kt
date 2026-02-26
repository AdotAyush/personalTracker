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

    @OptIn(ExperimentalCoroutinesApi::class)
    val uiState: StateFlow<List<HabitUiState>> = _selectedDate
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
                        currentStreak = 0 // Placeholder
                    )
                }
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

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
    
    fun createSampleData() {
         viewModelScope.launch {
            repository.createHabit(
                HabitEntity(
                    userId = userId,
                    title = "Drink Water",
                    description = "2L per day",
                    color = android.graphics.Color.BLUE,
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
                    description = "5km jog",
                    color = android.graphics.Color.RED,
                    iconName = "run",
                    recurrenceRule = "DAILY",
                    reminderTime = null,
                     tags = "fitness"
                )
            )
             repository.createHabit(
                HabitEntity(
                    userId = userId,
                    title = "Read",
                    description = "30 mins",
                    color = android.graphics.Color.YELLOW,
                    iconName = "book",
                    recurrenceRule = "DAILY",
                    reminderTime = null,
                     tags = "mind"
                )
            )
        }
    }
}
