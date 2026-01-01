const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Note: Metro symbolication JSON parsing errors are filtered by the startup script
// These errors are harmless and occur when React Native DevTools tries to symbolicate stack traces

module.exports = config;
