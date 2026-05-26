package com.sfmcexample

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     *
     * Must match the name passed to AppRegistry.registerComponent in index.js, the moduleName set
     * on iOS in AppDelegate.swift, and the rootProject.name in settings.gradle.
     */
    override fun getMainComponentName(): String = "SFMCExample"

    /**
     * Returns the instance of the ReactActivityDelegate. We use DefaultReactActivityDelegate which
     * allows you to enable New Architecture (Fabric) with a single boolean flag fabricEnabled.
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        // Pass null to onCreate so React Navigation re-creates a clean component tree on
        // configuration changes — the standard RN-with-Fabric pattern.
        super.onCreate(null)
    }
}
