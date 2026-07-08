# Consumer ProGuard rules for @sfmc/react-native-push.
# Applied automatically to consumer apps to prevent R8/ProGuard from stripping
# the SFMC native SDK, which relies on reflection/serialization. Mirrors the
# keep rules published by the SFMC Android SDK (common/consumer-rules.pro).

# Keep everything in the SDK package.
-keep class com.salesforce.marketingcloud.** { *; }
-keep @interface com.salesforce.marketingcloud.**
-keep enum com.salesforce.marketingcloud.** { *; }

# Android Parcelable patterns.
-keepclassmembers class com.salesforce.marketingcloud.** implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}
-keepnames class com.salesforce.marketingcloud.** implements android.os.Parcelable

# Prevent obfuscation warnings.
-dontwarn com.salesforce.marketingcloud.**
