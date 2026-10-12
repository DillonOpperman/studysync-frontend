package com.studysync.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    val googleAppId = resources.getIdentifier("google_app_id", "string", packageName)
    if (googleAppId != 0) {
      try {
        val clazz = Class.forName("com.google.firebase.FirebaseApp")
        val init = clazz.getMethod("initializeApp", android.content.Context::class.java)
        init.invoke(null, this)
      } catch (_: Exception) {
      }
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel =
          NotificationChannel(
              "studysync_alerts",
              "StudySync alerts",
              NotificationManager.IMPORTANCE_DEFAULT,
          )
      channel.description = "Friend requests, group updates, and messages"
      getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }
    loadReactNative(this)
  }
}
