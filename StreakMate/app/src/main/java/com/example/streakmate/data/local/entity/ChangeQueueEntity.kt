package com.example.streakmate.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "change_queue")
data class ChangeQueueEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val entityName: String, // "HABIT", "HABIT_LOG", "USER"
    val entityId: String,   // String representation of ID
    val operation: String,  // "INSERT", "UPDATE", "DELETE"
    val timestamp: Long = System.currentTimeMillis()
)
