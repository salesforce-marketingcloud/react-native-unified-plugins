// Force-include workspace packages by explicit root path so that yarn-workspace
// symlinks don't trip up the RN CLI's autolinking discovery.

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
