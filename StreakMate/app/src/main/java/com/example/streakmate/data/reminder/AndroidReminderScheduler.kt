package com.example.streakmate.data.reminder

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.example.streakmate.data.local.entity.HabitEntity
import com.example.streakmate.domain.reminder.ReminderScheduler
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject

class AndroidReminderScheduler @Inject constructor(
    @ApplicationContext private val context: Context
) : ReminderScheduler {

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    override fun scheduleReminder(habit: HabitEntity) {
        val reminderTime = habit.reminderTime ?: return
        
        // Convert to PendingIntent
        val intent = Intent(context, ReminderReceiver::class.java).apply {
            putExtra("HABIT_ID", habit.id)
            putExtra("HABIT_TITLE", habit.title)
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            habit.id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Schedule
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                     alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        reminderTime,
                        pendingIntent
                    )
                }
            } else {
                 alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    reminderTime,
                    pendingIntent
                )
            }
        } catch (e: SecurityException) {
            // Log or handle missing permission
        }
    }

    override fun cancelReminder(habit: HabitEntity) {
        val intent = Intent(context, ReminderReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            habit.id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
    }
}
