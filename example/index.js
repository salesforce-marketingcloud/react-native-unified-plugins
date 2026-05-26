import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// The component name registered here MUST match:
//   - "name" in app.json
//   - getMainComponentName() in MainActivity.kt
//   - moduleName in AppDelegate.swift
//   - rootProject.name in settings.gradle
// Drift between any of these surfaces as a "module not registered" red screen at launch.
AppRegistry.registerComponent(appName, () => App);
