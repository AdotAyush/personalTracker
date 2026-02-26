package com.example.streakmate.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = OnPrimary,
    primaryContainer = PrimaryContainerLight,
    onPrimaryContainer = PrimaryDark,
    secondary = Secondary,
    onSecondary = OnSecondary,
    secondaryContainer = SecondaryContainerLight,
    onSecondaryContainer = SecondaryDark,
    tertiary = Tertiary,
    onTertiary = Color.White,
    tertiaryContainer = TertiaryContainerLight,
    onTertiaryContainer = Tertiary,
    background = BackgroundLight,
    onBackground = OnSurfaceLight,
    surface = SurfaceLight,
    onSurface = OnSurfaceLight,
    surfaceVariant = SurfaceContainerHighLight,
    onSurfaceVariant = OnSurfaceVariantLight,
    outline = OutlineLight,
    outlineVariant = OutlineVariantLight,
    error = ErrorColor,
    errorContainer = ErrorContainerLight,
    inverseSurface = SurfaceDark,
    inverseOnSurface = OnSurfaceDark
)

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryLight,
    onPrimary = PrimaryDark,
    primaryContainer = PrimaryContainerDark,
    onPrimaryContainer = PrimaryLight,
    secondary = SecondaryLight,
    onSecondary = SecondaryDark,
    secondaryContainer = SecondaryContainerDark,
    onSecondaryContainer = SecondaryLight,
    tertiary = TertiaryLight,
    onTertiary = Color.White,
    tertiaryContainer = TertiaryContainerDark,
    onTertiaryContainer = TertiaryLight,
    background = BackgroundDark,
    onBackground = OnSurfaceDark,
    surface = SurfaceDark,
    onSurface = OnSurfaceDark,
    surfaceVariant = SurfaceContainerHighDark,
    onSurfaceVariant = OnSurfaceVariantDark,
    outline = OutlineDark,
    outlineVariant = OutlineVariantDark,
    error = ErrorColor,
    errorContainer = ErrorContainerDark,
    inverseSurface = SurfaceLight,
    inverseOnSurface = OnSurfaceLight
)

@Composable
fun StreakMateTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = Color.Transparent.toArgb()
            window.navigationBarColor = Color.Transparent.toArgb()
            val controller = WindowCompat.getInsetsController(window, view)
            controller.isAppearanceLightStatusBars = !darkTheme
            controller.isAppearanceLightNavigationBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

