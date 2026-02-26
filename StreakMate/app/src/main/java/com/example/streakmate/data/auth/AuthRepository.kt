package com.example.streakmate.data.auth

import android.content.Context
import android.content.SharedPreferences
import com.example.streakmate.data.local.dao.UserDao
import com.example.streakmate.data.local.entity.UserEntity
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    private val userDao: UserDao
) {
    private val prefs: SharedPreferences = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)

    fun isLoggedIn(): Boolean {
        return prefs.getBoolean("is_logged_in", false)
    }

    private fun setLoggedIn(loggedIn: Boolean) {
        prefs.edit().putBoolean("is_logged_in", loggedIn).apply()
    }

    fun getUserId(): String {
        return prefs.getString("user_id", "user_1") ?: "user_1"
    }

    suspend fun register(email: String, pass: String): Boolean {
        return withContext(Dispatchers.IO) {
            // Create user in DB so FK constraints work
            val user = UserEntity(
                id = "user_1",
                email = email,
                displayName = "User",
                photoUrl = null
            )
            userDao.insertUser(user)
            
            setLoggedIn(true)
            true
        }
    }
    
    suspend fun login(email: String, pass: String): Boolean {
        return withContext(Dispatchers.IO) {
            // Also ensure user exists on login (for mock purposes)
            val user = UserEntity(
                id = "user_1",
                email = email,
                displayName = "User",
                photoUrl = null
            )
            userDao.insertUser(user)
            
            setLoggedIn(true)
            true
        }
    }
    
    suspend fun ensureUserExists() {
        withContext(Dispatchers.IO) {
            val user = UserEntity(
                id = "user_1",
                email = "user@streakmate.app",
                displayName = "User",
                photoUrl = null
            )
            userDao.insertUser(user)
        }
    }

    fun logout() {
        setLoggedIn(false)
    }
}
