package com.example.streakmate.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable

import com.example.streakmate.ui.screens.login.LoginScreen
import com.example.streakmate.ui.screens.home.HomeScreen
import com.example.streakmate.ui.screens.habit.CreateEditHabitScreen
import com.example.streakmate.ui.screens.detail.HabitDetailScreen
import com.example.streakmate.ui.screens.calendar.CalendarScreen

object Route {
    const val LOGIN = "login"
    const val HOME = "home"
    const val CREATE_EDIT_HABIT = "create_edit_habit/{habitId}"
    const val HABIT_DETAIL = "habit_detail/{habitId}"
    const val CALENDAR = "calendar"
    
    fun createEditHabit(habitId: Long = -1) = "create_edit_habit/$habitId"
    fun habitDetail(habitId: Long) = "habit_detail/$habitId"
}

@Composable
fun StreakMateNavGraph(navController: NavHostController) {
    NavHost(navController = navController, startDestination = Route.LOGIN) {
        composable(Route.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Route.HOME) {
                        popUpTo(Route.LOGIN) { inclusive = true }
                    }
                }
            )
        }
        composable(Route.HOME) {
            HomeScreen(
                onHabitClick = { habitId -> navController.navigate(Route.habitDetail(habitId)) },
                onCreateHabitClick = { navController.navigate(Route.createEditHabit()) },
                onCalendarClick = { navController.navigate(Route.CALENDAR) }
            )
        }
        composable(Route.CREATE_EDIT_HABIT) { backStackEntry ->
            val habitId = backStackEntry.arguments?.getString("habitId")?.toLongOrNull() ?: -1L
            CreateEditHabitScreen(
                habitId = habitId,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable(Route.HABIT_DETAIL) { backStackEntry ->
            val habitId = backStackEntry.arguments?.getString("habitId")?.toLongOrNull() ?: -1L
            HabitDetailScreen(
                habitId = habitId,
                onEditClick = { navController.navigate(Route.createEditHabit(habitId)) },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable(Route.CALENDAR) {
            CalendarScreen(onNavigateBack = { navController.popBackStack() })
        }
    }
}
