const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withNativeWind } = require("nativewind/metro");

let config = getSentryExpoConfig(__dirname);

config.resolver.requireCycleIgnorePatterns = [/.*/];
module.exports = withNativeWind(config, {
  input: "./assets/styles/globals.css",
});
