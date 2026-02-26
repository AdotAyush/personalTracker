package com.example.streakmate.ui.screens.calendar

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.streakmate.data.local.entity.HabitLogEntity
import com.example.streakmate.data.repository.HabitRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.YearMonth
import javax.inject.Inject

data class DayData(
    val date: LocalDate,
    val completionCount: Int,
    val totalHabits: Int
)

@HiltViewModel
class CalendarViewModel @Inject constructor(
    private val repository: HabitRepository
) : ViewModel() {

    private val userId = "user_1"

    private val _currentMonth = MutableStateFlow(YearMonth.now())
    val currentMonth = _currentMonth.asStateFlow()

    private val _totalHabitCount = MutableStateFlow(0)

    init {
        viewModelScope.launch {
            repository.getActiveHabits(userId).collect { habits ->
                _totalHabitCount.value = habits.size
            }
        }
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    val monthData: StateFlow<Map<LocalDate, DayData>> = _currentMonth
        .flatMapLatest { month ->
            val startDate = month.atDay(1).toEpochDay()
            val endDate = month.atEndOfMonth().toEpochDay()

            combine(
                repository.getLogsForDateRange(startDate, endDate),
                _totalHabitCount
            ) { logs, totalHabits ->
                val logsByDate = logs.groupBy { it.date }
                val result = mutableMapOf<LocalDate, DayData>()

                for (day in 1..month.lengthOfMonth()) {
                    val date = month.atDay(day)
                    val epochDay = date.toEpochDay()
                    val dayLogs = logsByDate[epochDay] ?: emptyList()
                    result[date] = DayData(
                        date = date,
                        completionCount = dayLogs.distinctBy { it.habitId }.size,
                        totalHabits = totalHabits
                    )
                }
                result.toMap()
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyMap()
        )

    // Selected day's logs
    private val _selectedDate = MutableStateFlow<LocalDate?>(null)
    val selectedDate = _selectedDate.asStateFlow()

    @OptIn(ExperimentalCoroutinesApi::class)
    val selectedDayLogs: StateFlow<List<HabitLogEntity>> = _selectedDate
        .flatMapLatest { date ->
            if (date != null) {
                repository.getLogsForDate(date.toEpochDay())
            } else {
                flowOf(emptyList())
            }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun navigateMonth(offset: Int) {
        _currentMonth.value = _currentMonth.value.plusMonths(offset.toLong())
    }

    fun selectDate(date: LocalDate) {
        _selectedDate.value = if (_selectedDate.value == date) null else date
    }
}
