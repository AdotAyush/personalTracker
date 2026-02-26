package com.example.streakmate.ui.screens.habit

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.streakmate.data.local.entity.HabitEntity
import com.example.streakmate.data.repository.HabitRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CreateEditHabitViewModel @Inject constructor(
    private val repository: HabitRepository
) : ViewModel() {

    private val _habitTitle = MutableStateFlow("")
    val habitTitle = _habitTitle.asStateFlow()

    private val _habitDescription = MutableStateFlow("")
    val habitDescription = _habitDescription.asStateFlow()

    private val _frequency = MutableStateFlow("DAILY")
    val frequency = _frequency.asStateFlow()

    private val _selectedDays = MutableStateFlow<Set<Int>>(emptySet())
    val selectedDays = _selectedDays.asStateFlow()
    
    private var _habitId: Long = -1L

    fun initialize(habitId: Long) {
        _habitId = habitId
        if (habitId != -1L) {
            viewModelScope.launch {
                val habit = repository.getHabit(habitId) // Suspend here
                habit?.let { h ->
                    _habitTitle.value = h.title
                    _habitDescription.value = h.description ?: ""
                    
                    // Parse recurrence rule
                    val rule = h.recurrenceRule // e.g., "DAILY" or "WEEKLY:1,3,5"
                    if (rule.startsWith("WEEKLY")) {
                        _frequency.value = "WEEKLY"
                        val parts = rule.split(":")
                        if (parts.size > 1) {
                            val daysStr = parts[1]
                            if (daysStr.isNotEmpty()) {
                                _selectedDays.value = daysStr.split(",").mapNotNull {it.toIntOrNull()}.toSet()
                            }
                        }
                    } else {
                        _frequency.value = "DAILY"
                    }
                }
            }
        }
    }

    fun updateTitle(newTitle: String) {
        _habitTitle.value = newTitle
    }
    
    fun updateDescription(newDescription: String) {
        _habitDescription.value = newDescription
    }

    fun updateFrequency(freq: String) {
        _frequency.value = freq
    }

    fun toggleDaySelection(dayIndex: Int) {
        val current = _selectedDays.value
        if (current.contains(dayIndex)) {
            _selectedDays.value = current - dayIndex
        } else {
            _selectedDays.value = current + dayIndex
        }
    }

    fun saveHabit(onSaved: () -> Unit) {
        val currentTitle = _habitTitle.value
        if (currentTitle.isBlank()) return // Basic validation
        
        viewModelScope.launch {
            // Construct recurrence rule string
            val rule = if (_frequency.value == "WEEKLY") {
                val days = _selectedDays.value.sorted().joinToString(",")
                "WEEKLY:$days"
            } else {
                "DAILY"
            }

            val habit = HabitEntity(
                id = if (_habitId != -1L) _habitId else 0,
                userId = "user_1", // Mock
                title = currentTitle,
                description = _habitDescription.value,
                color = android.graphics.Color.BLUE,
                iconName = "star",
                recurrenceRule = rule,
                reminderTime = null,
                tags = ""
            )
            
            if (_habitId == -1L) {
                repository.createHabit(habit)
            } else {
                repository.updateHabit(habit)
            }
            onSaved()
        }
    }
}
