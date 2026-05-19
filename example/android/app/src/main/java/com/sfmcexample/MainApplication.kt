package com.sfmcexample

import android.app.Application
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
import com.salesforce.marketingcloud.mobileappmessaging.MobileAppMessagingConfig
import com.salesforce.marketingcloud.pushfeature.config.PushFeatureConfig
import com.salesforce.marketingcloud.inappmessagingfeature.config.InAppMessagingFeatureConfig
import com.salesforce.marketingcloud.pushfeature.notifications.NotificationCustomizationOptions
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
                .setNotificationCustomizationOptions(
                    // Use a system-provided resource rather than R.mipmap.ic_launcher so the
                    // example app builds without shipping custom launcher icons in templates.
                    NotificationCustomizationOptions.create(android.R.drawable.ic_dialog_info)
                ).build()

            inAppMessagingFeatureModuleConfig = InAppMessagingFeatureConfig.builder().build()
        }) { initStatus ->
            Log.i("SFMCExample", "SFMC SDK initialization status: $initStatus")
        }
    }
}
