package com.example.streakmate.ui.screens.home

import android.content.res.Configuration
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    // Inject ViewModel via hiltViewModel()
    viewModel: HomeViewModel = hiltViewModel(),
    onHabitClick: (Long) -> Unit,
    onCreateHabitClick: () -> Unit,
    onCalendarClick: () -> Unit,
) {
    val habitsState by viewModel.uiState.collectAsState()
    
    // Simple state to show a "Debug" menu to add sample data
    var showMenu by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text("Today", style = MaterialTheme.typography.titleLarge)
                        Text(
                            text = LocalDate.now().format(DateTimeFormatter.ofPattern("MMM d, yyyy")),
                            style = MaterialTheme.typography.labelMedium
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onCalendarClick) {
                        Icon(Icons.Default.DateRange, contentDescription = "Calendar")
                    }
                    IconButton(onClick = { showMenu = !showMenu }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "More")
                    }
                    DropdownMenu(
                        expanded = showMenu,
                        onDismissRequest = { showMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Add Sample Data") },
                            onClick = { 
                                viewModel.createSampleData()
                                showMenu = false
                            },
                        )
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onCreateHabitClick,
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Habit")
            }
        }
    ) { paddingValues ->
        if (habitsState.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("No habits found.", style = MaterialTheme.typography.bodyLarge)
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = { viewModel.createSampleData() }) {
                        Text("Create Sample Habits")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .padding(paddingValues)
                    .fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(habitsState, key = { it.habit.id }) { uiState ->
                    HabitItem(
                        uiState = uiState,
                        onItemClick = { onHabitClick(uiState.habit.id) },
                        onToggleCompletion = { isChecked ->
                            viewModel.toggleHabitCompletion(uiState.habit.id, isChecked)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun HabitItem(
    uiState: HabitUiState, 
    onItemClick: () -> Unit,
    onToggleCompletion: (Boolean) -> Unit
) {
    val habit = uiState.habit
    
    // Animation for card background based on completion
    val backgroundColor by animateColorAsState(
        targetValue = if (uiState.isCompletedToday) 
            MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.4f) 
        else 
            MaterialTheme.colorScheme.surface,
        label = "bgColor"
    )
    
    val scale by animateFloatAsState(
        targetValue = if (uiState.isCompletedToday) 0.98f else 1f,
        label = "scale"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .scale(scale)
            .clickable(onClick = onItemClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        elevation = CardDefaults.cardElevation(defaultElevation = if (uiState.isCompletedToday) 0.dp else 4.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically, 
                modifier = Modifier.weight(1f)
            ) {
                // Color Indicator
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .background(Color(habit.color), CircleShape)
                )
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column {
                    Text(
                        text = habit.title, 
                        style = MaterialTheme.typography.titleMedium.copy(
                            textDecoration = if (uiState.isCompletedToday) TextDecoration.LineThrough else null,
                            color = if (uiState.isCompletedToday) MaterialTheme.colorScheme.onSurface.copy(alpha=0.6f) else MaterialTheme.colorScheme.onSurface
                        )
                    )
                    if (!habit.description.isNullOrEmpty()) {
                        Text(
                            text = habit.description, 
                            style = MaterialTheme.typography.bodySmall, 
                            color = MaterialTheme.colorScheme.outline
                        )
                    }
                }
            }
            
            // Checkbox
            Checkbox(
                checked = uiState.isCompletedToday,
                onCheckedChange = { isChecked -> onToggleCompletion(isChecked) },
                colors = CheckboxDefaults.colors(
                    checkedColor = MaterialTheme.colorScheme.primary,
                    uncheckedColor = MaterialTheme.colorScheme.outline
                )
            )
        }
    }
}
