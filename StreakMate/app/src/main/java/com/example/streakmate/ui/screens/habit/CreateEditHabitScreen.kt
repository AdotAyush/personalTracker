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
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = true,
                    onClick = { /* Select Daily */ },
                    label = { Text("Daily") }
                )
                FilterChip(
                    selected = false,
                    onClick = { /* Select Weekly */ },
                    label = { Text("Weekly") }
                )
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
