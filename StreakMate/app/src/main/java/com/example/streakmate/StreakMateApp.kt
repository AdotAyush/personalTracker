package com.example.streakmate

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import androidx.work.Configuration
import javax.inject.Inject
import androidx.hilt.work.HiltWorkerFactory

@HiltAndroidApp
class StreakMateApp : Application(), Configuration.Provider {

    @Inject lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
}
