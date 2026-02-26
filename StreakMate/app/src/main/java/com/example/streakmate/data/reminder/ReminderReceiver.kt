package com.example.streakmate.data.reminder

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.app.NotificationManager
import android.app.NotificationChannel
import android.os.Build
import androidx.core.app.NotificationCompat
import com.example.streakmate.R // Assuming R is available (it will be after build)

class ReminderReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val habitTitle = intent.getStringExtra("HABIT_TITLE") ?: "Habit Reminder"
        val habitId = intent.getLongExtra("HABIT_ID", -1)

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "habit_reminders",
                "Habit Reminders",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(context, "habit_reminders")
            .setSmallIcon(R.mipmap.ic_launcher) // Basic placeholder
            .setContentTitle("Time to tracking!")
            .setContentText(habitTitle)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(habitId.toInt(), notification)
    }
}
