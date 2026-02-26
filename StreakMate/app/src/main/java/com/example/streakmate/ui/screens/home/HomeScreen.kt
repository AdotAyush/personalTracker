package com.example.streakmate.ui.screens.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import java.time.LocalDate
import java.time.format.DateTimeFormatter

// Mock model for UI development
data class HabitUiModel(
    val id: Long,
    val title: String,
    val streak: Int,
    val isCompletedToday: Boolean
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onHabitClick: (Long) -> Unit,
    onCreateHabitClick: () -> Unit,
    onCalendarClick: () -> Unit
) {
    // In a real app, collect state from ViewModel
    val habits = remember {
        listOf(
            HabitUiModel(1, "Morning Jog", 5, false),
            HabitUiModel(2, "Drink Water", 12, true),
            HabitUiModel(3, "Read 30 mins", 2, false)
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Today's Habits") },
                actions = {
                    IconButton(onClick = onCalendarClick) {
                        Icon(Icons.Default.DateRange, contentDescription = "Calendar")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onCreateHabitClick) {
                Icon(Icons.Default.Add, contentDescription = "Add Habit")
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                Text(
                    text = LocalDate.now().format(DateTimeFormatter.ofPattern("EEEE, MMM d")),
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            items(habits) { habit ->
                HabitItem(habit = habit, onClick = { onHabitClick(habit.id) })
            }
        }
    }
}

@Composable
fun HabitItem(habit: HabitUiModel, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = habit.title, style = MaterialTheme.typography.titleMedium)
                Text(text = "Streak: ${habit.streak} days", style = MaterialTheme.typography.bodySmall)
            }
            Checkbox(
                checked = habit.isCompletedToday,
                onCheckedChange = { /* Handle completion in ViewModel */ }
            )
        }
    }
}
