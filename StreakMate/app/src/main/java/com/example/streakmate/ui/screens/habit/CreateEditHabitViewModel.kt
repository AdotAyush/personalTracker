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
    
    private var _habitId: Long = -1L

    fun initialize(habitId: Long) {
        _habitId = habitId
        if (habitId != -1L) {
            viewModelScope.launch {
                val habit = repository.getHabit(habitId)
                if (habit != null) {
                    _habitTitle.value = habit.title
                    _habitDescription.value = habit.description ?: ""
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

    fun saveHabit(onSaved: () -> Unit) {
        if (_habitTitle.value.isBlank()) return
        
        viewModelScope.launch {
            val habit = HabitEntity(
                id = if (_habitId != -1L) _habitId else 0,
                userId = "user_1", // Mock
                title = _habitTitle.value,
                description = _habitDescription.value,
                color = android.graphics.Color.BLUE,
                iconName = "star",
                recurrenceRule = "DAILY",
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
