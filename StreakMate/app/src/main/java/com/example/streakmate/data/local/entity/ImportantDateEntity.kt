package com.example.streakmate.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "important_dates",
    foreignKeys = [
        ForeignKey(
            entity = UserEntity::class,
            parentColumns = ["id"],
            childColumns = ["userId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["userId"])]
)
data class ImportantDateEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: String,
    val title: String,
    val date: Long, // Epoch timestamp
    val isRecurring: Boolean = false,
    val reminderOffset: Long? = null // Reminder offset in millis
)
