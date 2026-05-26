package com.salesforce.mc.iam

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class SFMCIamPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == SFMCIamModule.NAME) SFMCIamModule(reactContext) else null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                SFMCIamModule.NAME to ReactModuleInfo(
                    SFMCIamModule.NAME,
                    SFMCIamModule::class.java.name,
                    false, false, false, true
                )
            )
        }
    }
}
