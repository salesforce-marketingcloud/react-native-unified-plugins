package com.salesforce.mc.sfmccore

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class SFMCSdkCorePackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == SFMCSdkCoreModule.NAME) SFMCSdkCoreModule(reactContext) else null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                SFMCSdkCoreModule.NAME to ReactModuleInfo(
                    SFMCSdkCoreModule.NAME,
                    SFMCSdkCoreModule::class.java.name,
                    false, false, false, true
                )
            )
        }
    }
}
