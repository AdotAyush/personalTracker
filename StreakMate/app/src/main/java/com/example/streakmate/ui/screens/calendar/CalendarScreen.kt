package com.example.streakmate.ui.screens.calendar

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarScreen(onNavigateBack: () -> Unit) {
    // Generate a simple heatmap for the current month
    val daysInMonth = (1..30).toList()
    val heatmapData = remember {
        (1..30).associateWith {
            (0..4).random() // Random intensity 0-4
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Activity Heatmap") },
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
            Text(
                "September 2023",
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            LazyVerticalGrid(
                columns = GridCells.Fixed(7),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                items(daysInMonth.size) { index ->
                    val day = daysInMonth[index]
                    val intensity = heatmapData[day] ?: 0
                    HeatmapCell(day, intensity)
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text("Legend", style = MaterialTheme.typography.labelMedium)
            Row(modifier = Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                (0..4).forEach { intensity ->
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .background(getColorForIntensity(intensity), RoundedCornerShape(4.dp))
                    )
                }
            }
            Text("Less -> More", style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun HeatmapCell(day: Int, intensity: Int) {
    Box(
        modifier = Modifier
            .aspectRatio(1f)
            .background(
                color = getColorForIntensity(intensity),
                shape = RoundedCornerShape(4.dp)
            ),
        contentAlignment = androidx.compose.ui.Alignment.Center
    ) {
        val textColor = if (intensity > 2) Color.White else Color.Black
        Text(
            text = day.toString(),
            color = textColor,
            style = MaterialTheme.typography.bodySmall,
            textAlign = TextAlign.Center
        )
    }
}

fun getColorForIntensity(intensity: Int): Color {
    return when (intensity) {
        0 -> Color(0xFFE0E0E0)
        1 -> Color(0xFFC8E6C9)
        2 -> Color(0xFFA5D6A7)
        3 -> Color(0xFF66BB6A)
        4 -> Color(0xFF2E7D32)
        else -> Color.Gray
    }
}
