package com.example.streakmate.ui.screens.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.streakmate.data.auth.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()
    
    // Simple state
    private val _isLogin = MutableStateFlow(true)
    val isLogin = _isLogin.asStateFlow()

    fun toggleMode() {
        _isLogin.value = !_isLogin.value
    }
    
    fun performAction(email: String, pass: String, onSuccess: () -> Unit) {
        if (email.isBlank() || pass.isBlank()) return
        
        viewModelScope.launch {
            _isLoading.value = true
            // Simulate network delay
            kotlinx.coroutines.delay(1000)
            
            val result = if (_isLogin.value) {
                authRepository.login(email, pass)
            } else {
                authRepository.register(email, pass)
            }
            
            if (result) {
                // Login state is handled inside repository
                onSuccess()
            }
            _isLoading.value = false
        }
    }
    
    fun checkSession(onLoggedIn: () -> Unit) {
        if (authRepository.isLoggedIn()) {
            onLoggedIn()
        }
    }
}
