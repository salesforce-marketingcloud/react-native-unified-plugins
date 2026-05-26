Pod::Spec.new do |s|
  s.name         = "SFMCMobileAppMessaging"
  s.version      = "1.0.0"
  s.summary      = "SFMC Mobile App Messaging SDK for React Native"
  s.homepage     = "https://github.com/salesforce-marketing-cloud/react-native-unified-plugins"
  s.license      = "MIT"
  s.author       = { "Salesforce Marketing Cloud" => "mc_mobile@salesforce.com" }
  s.source       = { :git => "https://github.com/salesforce-marketing-cloud/react-native-unified-plugins.git", :tag => "#{s.version}" }
  s.platform     = :ios, "15.1"
  s.source_files = "**/*.{h,m,mm,swift}"

  s.dependency "MarketingCloud-SFMCSdk", "~> 4.0.0"
  s.dependency "SFMobileAppMessagingSDK", "~> 2.0.0"
  s.pod_target_xcconfig = { 'ENABLE_BITCODE' => 'NO' }

  install_modules_dependencies(s)
end
