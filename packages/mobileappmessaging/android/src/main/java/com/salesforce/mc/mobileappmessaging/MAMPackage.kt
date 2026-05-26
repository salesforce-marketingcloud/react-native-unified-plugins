package com.salesforce.mc.mobileappmessaging

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class MAMPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == MAMModule.NAME) MAMModule(reactContext) else null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                MAMModule.NAME to ReactModuleInfo(
                    MAMModule.NAME,
                    MAMModule::class.java.name,
                    false, false, false, true
                )
            )
        }
    }
}
