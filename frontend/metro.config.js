
// metro.config.js
const {
    wrapWithReanimatedMetroConfig,
  } = require('react-native-reanimated/metro-config');
  
  const config = {
    // Your existing Metro configuration options
  };
  
  module.exports = wrapWithReanimatedMetroConfig(config);