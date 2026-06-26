import UIKit
import UserNotifications
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import SFMCSDK
import PushFeatureSDK
import InAppMessagingFeatureSDK
import MarketingCloudSDK
import MobileAppMessagingSDK


@main
class AppDelegate: RCTAppDelegate {


    let appID = "995b5b1a-162c-4e5d-a4cf-ac5ddeb14e47"
    let accessToken = "cyg6ftcd8sbqetq7wy5v7ez3"
    let appEndpointURL = "https://mcgrjfgk81ckrt0h4rwlnbhmbvf4.device.marketingcloudapis.com/"
    let mid = "NDA0NjoxMTQ6MA"

    let inbox = true
    let location = true
    let pushAnalytics = true
    let markMessageReadOnInboxNotificationOpen = true

    let mamAppID = "91a18bfa-6fe6-482a-a20b-a3b7d5e882a6"
    let mamAccessToken = "RWAOoBSiAH1LYeYrNMeQ7HMj"
    let mamServerURL = "https://api.salesforce.com"
    let mamTenantId = "core/prod/00DWt00000GomjNMAR"
    let mamAnalyticsEnabled = true

    // MARK: - UIApplicationDelegate

    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        self.moduleName = "SFMCExample"
        self.initialProps = [:]
        self.dependencyProvider = RCTAppDependencyProvider()
        configureSFMCSdk()
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }

    // MobilePush SDK: OPTIONAL IMPLEMENTATION (if using Data Protection)
    override func applicationProtectedDataDidBecomeAvailable(_ application: UIApplication) {
        configureSFMCSdk()
    }

    // MARK: - SDK Configuration

    @discardableResult
    func configureSFMCSdk() -> Bool {
#if DEBUG
        SFMCSdk.setLogger(logLevel: .debug)
#endif

        SFMCSdk.setFileProtectionType(fileProtectionType: .completeUntilFirstUserAuthentication)

        var configBuilder = ConfigBuilder()

        // Engagement (MarketingCloud) module
        if let appEndpoint = URL(string: appEndpointURL) {
            let engagementConfig = MarketingCloudSdkConfigBuilder(appId: appID)
                .setAccessToken(accessToken)
                .setMarketingCloudServerUrl(appEndpoint)
                .setMid(mid)
                .setInboxEnabled(inbox)
                .setLocationEnabled(location)
                .setAnalyticsEnabled(pushAnalytics)
                .setMarkMessageReadOnInboxNotificationOpen(markMessageReadOnInboxNotificationOpen)
                .build()
            configBuilder = configBuilder.setEngagement(config: engagementConfig)
        }

        // MobileAppMessaging module
        if let mamURL = URL(string: mamServerURL) {
            let mamConfig = MobileAppMessagingConfigBuilder(appId: mamAppID)
                .setAccessToken(mamAccessToken)
                .setMAMUrl(mamURL)
                .setTenantId(mamTenantId)
                .setAnalyticsEnabled(mamAnalyticsEnabled)
                .build()
            configBuilder = configBuilder.setMAM(config: mamConfig)
        }

        // PushFeature module
        let pushConfig = PushFeatureConfigBuilder()
            .setApplicationControlsBadging(true)
            .build()
        configBuilder = configBuilder.setPushFeature(config: pushConfig)

        // InAppMessaging module
        let iamConfig = InAppMessagingFeatureConfigBuilder().build()
        configBuilder = configBuilder.setInAppMessagingFeature(config: iamConfig)

        let completionHandler: ((_ status: [ModuleInitStatus]) -> Void) = { [weak self] status in
            DispatchQueue.main.async {
                self?.handleSDKInitializationCompletion(status: status)
            }
        }

        SFMCSdk.initializeSdk(configBuilder.build(), completion: completionHandler)

        return true
    }

    // MARK: - SDK Init Completion

    private func handleSDKInitializationCompletion(status: [ModuleInitStatus]) {
        for moduleStatus in status {
            print("Module: \(moduleStatus.moduleName.rawValue), Status: \(moduleStatus.initStatus.rawValue)")
            if moduleStatus.initStatus == .success {
                switch moduleStatus.moduleName {
                case .engagement:            setupEngagement()
                case .pushFeature:           setupPushFeature()
                case .inappMessagingFeature: setupInAppMessaging()
                case .mobileAppMessaging:    setupMobileAppMessaging()
                default: break
                }
            } else {
                print("❌ \(moduleStatus.moduleName.rawValue) failed: \(moduleStatus.initStatus.rawValue)")
            }
        }
    }

    // MARK: - Module Setup

    func setupEngagement() {
        MarketingCloudSdk.requestSdk { mp in
            mp?.setRegistrationCallback { reg in
                mp?.unsetRegistrationCallback()
                print("Registration callback: \(reg)")
            }
            mp?.startWatchingLocation()
        }
    }

    func setupPushFeature() {
        PushFeature.requestSdk { pushFeature in
            DispatchQueue.main.async {
                pushFeature?.setURLHandlingDelegate(self)
            }
        }

        DispatchQueue.main.async {
            UNUserNotificationCenter.current().delegate = self
            UNUserNotificationCenter.current().requestAuthorization(
                options: [.alert, .sound, .badge]
            ) { granted, error in
                if let error = error {
                    print("Push auth error: \(error)")
                }
            }
            UIApplication.shared.registerForRemoteNotifications()
        }
    }

    func setupMobileAppMessaging() {
        MobileAppMessaging.requestSdk { mamModule in
            mamModule?.setRegistrationCallback { regDict in
                mamModule?.unsetRegistrationCallback()
                print("MAM registration callback: \(regDict)")
            }
        }
    }

    func setupInAppMessaging() {
        InAppMessagingFeature.requestSdk { iamFeature in
            iamFeature?.setURLHandlingDelegate(self)
        }
    }

    // MARK: - Remote Notifications

    // PushFeature SDK: REQUIRED IMPLEMENTATION
    override func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        PushFeature.requestSdk { pushFeature in
            pushFeature?.setDeviceToken(deviceToken)
        }
    }

    // PushFeature SDK: REQUIRED IMPLEMENTATION
    override func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \(error)")
    }

    // PushFeature SDK: REQUIRED IMPLEMENTATION
    override func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        PushFeature.requestSdk { pushFeature in
            pushFeature?.setNotificationUserInfo(userInfo)
        }
        completionHandler(.newData)
    }

    // MARK: - RCTAppDelegate

    override func sourceURL(for bridge: RCTBridge) -> URL? {
        return bundleURL()
    }

    override func bundleURL() -> URL? {
#if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
    }
}

// MARK: - URLHandlingDelegate (PushFeature + IAM)

extension AppDelegate: URLHandlingDelegate {
    func sfmc_handleURL(_ url: URL, type: String) {
        UIApplication.shared.open(url, options: [:]) { success in
            print("Open \(url): \(success)")
        }
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension AppDelegate: UNUserNotificationCenterDelegate {

    // PushFeature SDK: REQUIRED IMPLEMENTATION
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        PushFeature.requestSdk { pushFeature in
            pushFeature?.setNotificationResponse(response)
        }
        completionHandler()
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound, .badge])
    }
}
