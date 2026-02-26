package com.example.streakmate.ui.screens.detail

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HabitDetailScreen(
    habitId: Long,
    onEditClick: () -> Unit,
    onNavigateBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Habit Details") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = onEditClick) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit")
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
            Text(
                text = "Morning Run", // Mock data
                style = MaterialTheme.typography.headlineLarge
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Run 5km every morning before work.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Current Streak", style = MaterialTheme.typography.labelMedium)
                    Text("13 Days", style = MaterialTheme.typography.displayMedium)
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            Text("Recent Activity", style = MaterialTheme.typography.titleMedium)
            
            // List of recent logs would go here
            Text("• Completed Yesterday", style = MaterialTheme.typography.bodyMedium)
            Text("• Completed 2 days ago", style = MaterialTheme.typography.bodyMedium)
        }
    }
}
