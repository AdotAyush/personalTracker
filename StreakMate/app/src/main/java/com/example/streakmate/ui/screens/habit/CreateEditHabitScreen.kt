package com.example.streakmate.ui.screens.habit

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateEditHabitScreen(
    habitId: Long,
    onNavigateBack: () -> Unit,
    viewModel: CreateEditHabitViewModel = hiltViewModel()
) {
    LaunchedEffect(habitId) {
        viewModel.initialize(habitId)
    }

    val title by viewModel.habitTitle.collectAsState()
    val description by viewModel.habitDescription.collectAsState()
    val selectedFrequency by viewModel.frequency.collectAsState()
    val selectedDays by viewModel.selectedDays.collectAsState()
    
    val isEditMode = habitId != -1L
    val screenTitle = if (isEditMode) "Edit Habit" else "Create New Habit"

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(screenTitle) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp)
                .fillMaxSize()
        ) {
            OutlinedTextField(
                value = title,
                onValueChange = viewModel::updateTitle,
                label = { Text("Title") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = description,
                onValueChange = viewModel::updateDescription,
                label = { Text("Description (Optional)") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3
            )
            Spacer(modifier = Modifier.height(24.dp))
            
            Text("Frequency", style = MaterialTheme.typography.titleSmall)
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = selectedFrequency == "DAILY",
                    onClick = { viewModel.updateFrequency("DAILY") },
                    label = { Text("Daily") }
                )
                FilterChip(
                    selected = selectedFrequency == "WEEKLY",
                    onClick = { viewModel.updateFrequency("WEEKLY") },
                    label = { Text("Weekly") }
                )
            }
            
            if (selectedFrequency == "WEEKLY") {
                Spacer(modifier = Modifier.height(16.dp))
                Text("Select Days:", style = MaterialTheme.typography.bodyMedium)
                Spacer(modifier = Modifier.height(8.dp))
                
                // Day Selection Grid
                val days = listOf("M", "T", "W", "T", "F", "S", "S")
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    days.forEachIndexed { index, day ->
                        val isSelected = selectedDays.contains(index)
                        FilterChip(
                            selected = isSelected,
                            onClick = { viewModel.toggleDaySelection(index) },
                            label = { Text(day) },
                            modifier = Modifier.size(40.dp)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.weight(1f))
            
            Button(
                onClick = {
                    viewModel.saveHabit(onSaved = onNavigateBack)
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = title.isNotBlank()
            ) {
                Text(if (isEditMode) "Save Changes" else "Create Habit")
            }
        }
    }
}
