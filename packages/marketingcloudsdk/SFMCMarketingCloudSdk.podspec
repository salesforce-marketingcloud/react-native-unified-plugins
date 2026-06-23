require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "SFMCMarketingCloudSdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = package["description"]
  s.homepage     = package["homepage"]
  s.license      = { :file => "LICENSE" }
  s.author       = package["author"]
  s.source       = { :git => "https://github.com/salesforce-marketingcloud/react-native-unified-plugins.git", :tag => "#{s.version}" }
  s.platform     = :ios, "15.1"
  s.source_files = "ios/**/*.{h,m,mm,swift}"

  s.dependency "MarketingCloud-SFMCSdk", "~> 4.0.0"
  s.dependency "MarketingCloudSDK", "~> 11.0.0"
  s.pod_target_xcconfig = { 'ENABLE_BITCODE' => 'NO' }

  install_modules_dependencies(s)
end
