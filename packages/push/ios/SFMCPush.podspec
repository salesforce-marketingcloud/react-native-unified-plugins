Pod::Spec.new do |s|
  s.name         = "SFMCPush"
  s.version      = "1.0.0"
  s.summary      = "SFMC Push Feature SDK for React Native"
  s.homepage     = "https://github.com/salesforce-marketing-cloud/react-native-unified-plugins"
  s.license      = "MIT"
  s.author       = { "Salesforce Marketing Cloud" => "mc_mobile@salesforce.com" }
  s.source       = { :git => "https://github.com/salesforce-marketing-cloud/react-native-unified-plugins.git", :tag => "#{s.version}" }
  s.platform     = :ios, "15.1"
  s.source_files = "**/*.{h,m,mm,swift}"

  s.dependency "MarketingCloud-SFMCSdk"
  s.dependency "SFPushFeatureSDK"
  s.pod_target_xcconfig = { 'ENABLE_BITCODE' => 'NO' }

  install_modules_dependencies(s)
end
