package com.example.streakmate.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ForeignKey
import androidx.room.Index

@Entity(
    tableName = "habits",
    indices = [Index(value = ["title"])],
    foreignKeys = [
        ForeignKey(
            entity = UserEntity::class,
            parentColumns = ["id"],
            childColumns = ["userId"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class HabitEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: String,
    val title: String,
    val description: String?,
    val color: Int, // Color Int
    val iconName: String?,
    val priority: Int = 0,
    val tags: String?, // Comma separated tags
    val recurrenceRule: String, // E.g., "DAILY", "WEEKLY:MON,WED,FRI"
    val reminderTime: Long?, // Time in epoch millis
    val createdAt: Long = System.currentTimeMillis(),
    val archived: Boolean = false
)

@Entity(
    tableName = "habit_logs",
    foreignKeys = [
        ForeignKey(
            entity = HabitEntity::class,
            parentColumns = ["id"],
            childColumns = ["habitId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["habitId"]), Index(value = ["date"])]
)
data class HabitLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val habitId: Long,
    val date: Long, // Epoch day or specific timestamp representing the date (normalized to midnight)
    val completedAt: Long = System.currentTimeMillis(),
    val note: String? = null,
    val imagePath: String? = null
)
