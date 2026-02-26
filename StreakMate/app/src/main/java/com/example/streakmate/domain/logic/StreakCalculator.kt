package com.example.streakmate.domain.logic

import com.example.streakmate.data.local.entity.HabitLogEntity
import java.time.LocalDate
import java.time.ZoneId

object StreakCalculator {

    fun calculateStreak(logs: List<HabitLogEntity>, currentDate: LocalDate = LocalDate.now()): Int {
        if (logs.isEmpty()) return 0

        val logsDates = logs.map {
            // Convert to LocalDate
            val instant = Instant.ofEpochMilli(it.date)
            instant.atZone(ZoneId.systemDefault()).toLocalDate()
        }.distinct().sortedDescending()
        
        if (logsDates.isEmpty()) return 0

        var currentCheck = currentDate
        var streak = 0

        // Check if the streak is active (logged today or yesterday)
        // If the latest log is today, streak continues from today.
        // If the latest log is yesterday, streak continues from yesterday.
        // If latest log is earlier, streak is broken -> 0.
        
        val latestLogDate = logsDates.first()
        
        if (latestLogDate == currentDate) {
            streak++
            currentCheck = currentDate.minusDays(1)
        } else if (latestLogDate == currentDate.minusDays(1)) {
            streak++ 
            currentCheck = currentDate.minusDays(1)
            // But we already moved currentCheck, so we need to process logs again properly
            // Let's iterate simply
            currentCheck = currentDate.minusDays(2) // next to check after yesterday
        } else {
            return 0
        }

        // Iterate remaining logs
        for (i in 1 until logsDates.size) {
            val date = logsDates[i]
            if (date == currentCheck) {
                streak++
                currentCheck = currentCheck.minusDays(1)
            } else {
                break // gap
            }
        }
        
        return streak
    }
}
