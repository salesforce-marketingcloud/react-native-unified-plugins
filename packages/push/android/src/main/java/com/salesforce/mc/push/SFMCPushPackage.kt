package com.salesforce.mc.push

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class SFMCPushPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == SFMCPushModule.NAME) SFMCPushModule(reactContext) else null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                SFMCPushModule.NAME to ReactModuleInfo(
                    SFMCPushModule.NAME,
                    SFMCPushModule::class.java.name,
                    false, false, false, true
                )
            )
        }
    }
}
