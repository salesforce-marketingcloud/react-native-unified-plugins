package com.sfmcexample

import android.content.Context
import com.salesforce.marketingcloud.pushfeature.notifications.NotificationManager
import com.salesforce.marketingcloud.pushmodels.NotificationMessage

/**
 * The app-owned decision for whether an incoming SFMC push is displayed.
 *
 * This is registered once, at SDK-configuration time, in [MainApplication].
 * `Application.onCreate` runs on EVERY process start — including an app-killed
 * FCM cold-start, where a data message boots the process into `onCreate` and
 * `SFMCSdk.configure(...)` but never runs the React Native JS runtime.
 *
 * The SFMC SDK exposes a single `ShouldShowNotificationListener` slot, and the
 * host app owns it. The decision is made **entirely in native code**: the SDK
 * invokes this callback synchronously on the FCM thread, and there is no
 * guarantee a React Native engine is running (the killed-state cold-start above
 * is the clearest case), so a JavaScript handler cannot be consulted reliably.
 * Any display rule the host app needs — quiet hours, per-channel prefs, a server
 * flag cached to SharedPreferences, feature flags — lives here.
 *
 * This example combines an app-owned master switch (a "notifications enabled"
 * flag read from SharedPreferences via [appContext]) with a content rule that
 * suppresses any push whose title or alert contains the sentinel "[suppress]";
 * replace [shouldShow] with your own logic.
 */
class ExampleShouldShowNotificationListener(context: Context) :
    NotificationManager.ShouldShowNotificationListener {

    // Held as applicationContext so this listener can read app state (prefs,
    // etc.) during the decision without leaking an Activity/Service.
    private val appContext: Context = context.applicationContext

    override fun shouldShowNotification(message: NotificationMessage): Boolean {
        return shouldShow(message)
    }

    /**
     * The display decision, made purely from native inputs. This example first
     * honors an app-owned "notifications enabled" flag read from
     * SharedPreferences (via [appContext]), then suppresses any push whose
     * title or alert contains the sentinel "[suppress]". A real app would
     * consult its own persisted settings here (quiet hours, per-channel prefs,
     * a server flag cached to SharedPreferences, and so on).
     */
    private fun shouldShow(message: NotificationMessage): Boolean {
        // App-owned master switch — demonstrates reading persisted app state
        // via appContext without leaking an Activity/Service.
        val notificationsEnabled = appContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getBoolean(KEY_NOTIFICATIONS_ENABLED, true)
        if (!notificationsEnabled) return false

        val text = "${message.title.orEmpty()} ${message.alert.orEmpty()}".lowercase()
        return !text.contains(SUPPRESS_SENTINEL)
    }

    private companion object {
        const val PREFS_NAME = "sfmc_example_prefs"
        const val KEY_NOTIFICATIONS_ENABLED = "notifications_enabled"

        // Obviously-artificial placeholder — replace with your real content rule.
        const val SUPPRESS_SENTINEL = "[suppress]"
    }
}
