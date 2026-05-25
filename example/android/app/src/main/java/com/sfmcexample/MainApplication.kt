package com.sfmcexample

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager as AndroidNotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.salesforce.marketingcloud.MarketingCloudConfig
import com.salesforce.marketingcloud.UrlHandler
import com.salesforce.marketingcloud.mobileappmessaging.MobileAppMessagingConfig
import com.salesforce.marketingcloud.pushfeature.config.PushFeatureConfig
import com.salesforce.marketingcloud.inappmessagingfeature.config.InAppMessagingFeatureConfig
import com.salesforce.marketingcloud.pushfeature.notifications.NotificationCustomizationOptions
import com.salesforce.marketingcloud.pushfeature.notifications.NotificationManager
import com.salesforce.marketingcloud.pushmodels.NotificationMessage
import com.salesforce.marketingcloud.pushmodels.NotificationMessage.Type as MessageType
import com.salesforce.marketingcloud.sfmcsdk.SFMCSdk
import com.salesforce.marketingcloud.sfmcsdk.SFMCSdkModuleConfig
import com.salesforce.marketingcloud.sfmcsdk.components.logging.LogLevel
import com.salesforce.marketingcloud.sfmcsdk.components.logging.LogListener

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> = PackageList(this).packages
            override fun getJSMainModuleName(): String = "index"
            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
            override val isNewArchEnabled: Boolean = true
            override val isHermesEnabled: Boolean = true
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        // CRITICAL: Use ReactNativeApplicationEntryPoint — NOT manual SoLoader.init() + load().
        // This initializes SoLoader with OpenSourceMergedSoMapping for merged .so support.
        ReactNativeApplicationEntryPoint.loadReactNative(this)

        // Surface SFMC SDK init / push / IAM / network activity in logcat for debug builds.
        // Silent init failures (wrong app ID, missing access token, FirebaseApp not initialised)
        // are very hard to diagnose without this. LogListener.AndroidLogger is an open class —
        // instantiate with `()`. Release builds keep logging off so production users never see
        // SDK chatter.
        if (BuildConfig.DEBUG) {
            SFMCSdk.setLogging(LogLevel.DEBUG, LogListener.AndroidLogger())
        }

        initializeSFMCSdk()
    }

    private fun initializeSFMCSdk() {
        SFMCSdk.configure(this, SFMCSdkModuleConfig.build {
            // MarketingCloudConfig.Builder() and MobileAppMessagingConfig.Builder() constructors
            // are PUBLIC — either .Builder() or .builder() compiles. We use .builder() for
            // consistency with the other two configs below.
            engagementModuleConfig = MarketingCloudConfig.builder()
                .setApplicationId(BuildConfig.MC_APP_ID)
                .setAccessToken(BuildConfig.MC_ACCESS_TOKEN)
                .setMarketingCloudServerUrl(BuildConfig.MC_SERVER_URL)
                .setMid(BuildConfig.MC_MID)
                .setInboxEnabled(true)
                .build(this@MainApplication)

            mamModuleConfig = MobileAppMessagingConfig.builder()
                .moduleApplicationId(BuildConfig.MAM_APP_ID)
                .tenantId(BuildConfig.MAM_TENANT_ID)
                .accessToken(BuildConfig.MAM_ACCESS_TOKEN)
                .endpointUrl(BuildConfig.MAM_ENDPOINT_URL)
                .build()

            // PushFeatureConfig.Builder() and InAppMessagingFeatureConfig.Builder() constructors
            // are INTERNAL — must use the static builder() factory. Writing .Builder() would
            // fail with: "Cannot access 'constructor(): ...Builder': it is internal".
            pushFeatureModuleConfig = PushFeatureConfig.builder()
                .setNotificationCustomizationOptions(buildNotificationOptions())
                .setUrlHandler(SfmcUrlHandler)
                .build()

            inAppMessagingFeatureModuleConfig = InAppMessagingFeatureConfig.builder()
                .setUrlHandler(SfmcUrlHandler)
                .build()
        }) { initStatus ->
            Log.i("SFMCExample", "SFMC SDK initialization status: $initStatus")
        }
    }

    // ─── Push notification simplified customization ─────────────────────────────
    //
    // Per https://developer.salesforce.com/docs/marketing/mobile-unified-sdk/guide/customize-push-notifications-android.html
    // ("Simplified Customization"). We hand the SDK three things and it builds the
    // notification itself:
    //   1. small-icon resource id
    //   2. NotificationLaunchIntentProvider — PendingIntent for the body tap
    //   3. NotificationChannelIdProvider     — channel id (we ensure it exists)
    private fun buildNotificationOptions(): NotificationCustomizationOptions {
        return NotificationCustomizationOptions.create(
            android.R.drawable.ic_dialog_info,
            NotificationManager.NotificationLaunchIntentProvider { context, message ->
                buildLaunchIntent(context, message)
            },
            NotificationManager.NotificationChannelIdProvider { context, _ ->
                ensureChannel(context)
            },
        )
    }

    // Tap intent for the notification body. For OpenDirect / CloudPage messages we dispatch
    // through SfmcUrlHandler so the URL is opened (matches the SDK's default routing for
    // those message types). For everything else we just open MainActivity. Either way the
    // PendingIntent is wrapped via NotificationManager.redirectIntentForAnalytics so the
    // SDK records the open event.
    private fun buildLaunchIntent(
        context: Context,
        message: NotificationMessage,
    ): PendingIntent {
        val base = when (message.type) {
            MessageType.OPEN_DIRECT -> message.url
                ?.let { SfmcUrlHandler.handleUrl(context, it, UrlHandler.URL) }
                ?: defaultActivityIntent(context, message)

            MessageType.CLOUD_PAGE -> message.url
                ?.let { SfmcUrlHandler.handleUrl(context, it, UrlHandler.CLOUD_PAGE) }
                ?: defaultActivityIntent(context, message)

            else -> defaultActivityIntent(context, message)
        }
        return NotificationManager.redirectIntentForAnalytics(context, base, message, true)
    }

    private fun defaultActivityIntent(
        context: Context,
        message: NotificationMessage,
    ): PendingIntent {
        val launch = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            message.url?.let { putExtra(EXTRA_PUSH_URL, it) }
        }
        // Android 12+ requires explicit mutability. The SDK rewrites the wrapping intent
        // to insert analytics data, so the wrapped intent must be MUTABLE.
        val mutability = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.FLAG_MUTABLE
        } else {
            0
        }
        return PendingIntent.getActivity(
            context,
            message.id.hashCode(),
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT or mutability,
        )
    }

    // Register the SDK's default channel ("marketing") with the app's display name.
    private fun ensureChannel(context: Context): String {
        val channelId = NotificationManager.DEFAULT_CHANNEL_ID
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val sys = context.getSystemService(Context.NOTIFICATION_SERVICE) as AndroidNotificationManager
            if (sys.getNotificationChannel(channelId) == null) {
                sys.createNotificationChannel(
                    NotificationChannel(
                        channelId,
                        context.getString(R.string.app_name),
                        AndroidNotificationManager.IMPORTANCE_DEFAULT,
                    ),
                )
            }
        }
        return channelId
    }

    // ─── UrlHandler ─────────────────────────────────────────────────────────────
    //
    // Invoked by the SDK when a user taps a Web URL / App URL action button or
    // carousel item in a push message. Returning a PendingIntent forwards control
    // to that target; returning null lets the SDK silently drop the action.
    // urlSource is one of UrlHandler.ACTION / DEEPLINK / CLOUD_PAGE / URL / APP_OPEN.
    object SfmcUrlHandler : UrlHandler {
        override fun handleUrl(context: Context, url: String, urlSource: String): PendingIntent? {
            Log.i("SFMCExample", "SfmcUrlHandler: handleUrl: url: $url, urlSource: $urlSource")
            val uri = runCatching { Uri.parse(url) }.getOrNull() ?: return null
            val intent = when (urlSource) {
                UrlHandler.DEEPLINK -> Intent(Intent.ACTION_VIEW, uri).apply {
                    setPackage(context.packageName)
                }
                UrlHandler.URL, UrlHandler.CLOUD_PAGE -> Intent(Intent.ACTION_VIEW, uri)
                else -> Intent(Intent.ACTION_VIEW, uri)
            }
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            // ACTION_VIEW with a URL is an implicit intent. Targeting Android 14+ disallows
            // FLAG_MUTABLE on PendingIntents that wrap implicit intents, so this MUST be
            // FLAG_IMMUTABLE. redirectIntentForAnalytics wraps this PendingIntent rather
            // than mutating its inner Intent, so immutable is correct.
            val mutability = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                PendingIntent.FLAG_IMMUTABLE
            } else {
                0
            }
            return PendingIntent.getActivity(
                context,
                url.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or mutability,
            )
        }
    }

    companion object {
        const val EXTRA_PUSH_URL = "com.sfmcexample.PUSH_URL"
    }
}
