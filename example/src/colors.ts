import { Platform, PlatformColor } from 'react-native';

// Cross-platform semantic color resolver.
//
// PlatformColor expects iOS UIColor names on iOS (e.g. 'label', 'systemBlue')
// and Android resource names on Android — they are NOT interchangeable. Passing
// an iOS token like 'systemBlue' to PlatformColor on Android resolves to nothing
// and any view that requires a real color (ActivityIndicator, ProgressBar, etc.)
// crashes at mount time with:
//
//   JSApplicationCausedNativeException: ColorValue: None of the paths in the
//   `resource_paths` array resolved to a color resource.
//
// To keep one set of style code working on both platforms, we map each iOS
// semantic token to a hex equivalent for Android. iOS keeps automatic
// light/dark adaptation via PlatformColor; Android uses the literal hex below.
export type SemanticColor =
    | 'systemGroupedBackground'
    | 'secondarySystemGroupedBackground'
    | 'tertiarySystemFill'
    | 'label'
    | 'secondaryLabel'
    | 'tertiaryLabel'
    | 'separator'
    | 'placeholderText'
    | 'systemBlue'
    | 'systemRed'
    | 'systemGreen'
    | 'systemOrange';

const ANDROID_FALLBACKS: Record<SemanticColor, string> = {
    systemGroupedBackground: '#F2F2F7',
    secondarySystemGroupedBackground: '#FFFFFF',
    tertiarySystemFill: '#E5E5EA',
    label: '#000000',
    secondaryLabel: '#3C3C43',
    tertiaryLabel: '#9A9A9F',
    separator: '#C6C6C8',
    placeholderText: '#9A9A9F',
    systemBlue: '#007AFF',
    systemRed: '#FF3B30',
    systemGreen: '#34C759',
    systemOrange: '#FF9500',
};

export function color(token: SemanticColor): string {
    if (Platform.OS === 'ios') {
        return PlatformColor(token) as unknown as string;
    }
    return ANDROID_FALLBACKS[token];
}
