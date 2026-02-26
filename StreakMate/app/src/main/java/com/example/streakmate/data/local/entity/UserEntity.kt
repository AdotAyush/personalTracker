package com.example.streakmate.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.datetime.Instant

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String, // Likely UUID from Auth provider
    val email: String,
    val displayName: String?,
    val photoUrl: String?,
    val createdAt: Long = System.currentTimeMillis()
)
