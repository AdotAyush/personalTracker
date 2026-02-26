package com.example.streakmate.domain.reminder

import com.example.streakmate.data.local.entity.HabitEntity

interface ReminderScheduler {
    fun scheduleReminder(habit: HabitEntity)
    fun cancelReminder(habit: HabitEntity)
}
