// React Native CLI config. Two responsibilities:
//
// 1. Tell `pod install` (via the cli-platform-ios native_modules.rb) where the
//    autolinking metadata lives. We commit a static autolinking.json under
//    android/ to bypass dynamic discovery in the monorepo, so the native_modules
//    Ruby helpers are skipped at the project level — but the iOS side still
//    walks dependencies.
// 2. Force-include the workspace packages by name so that yarn-workspace
//    symlinks don't trip up the CLI's "is this in node_modules?" check.

module.exports = {
    project: {
        ios: {},
        android: {},
    },
    dependencies: {
        '@salesforce-mc/react-native-sfmc-core': {
            root: '../packages/sfmc-core',
        },
        '@salesforce-mc/react-native-push': {
            root: '../packages/push',
        },
        '@salesforce-mc/react-native-iam': {
            root: '../packages/iam',
        },
        '@salesforce-mc/react-native-marketingcloudsdk': {
            root: '../packages/marketingcloudsdk',
        },
        '@salesforce-mc/react-native-mobileappmessaging': {
            root: '../packages/mobileappmessaging',
        },
    },
};
