const { withAndroidStyles } = require("@expo/config-plugins");

function addTranslucentNavAndStatus(styles) {
  // Find the AppTheme style
  const appTheme = styles.resources.style.find(
    (style) => style.$["name"] === "AppTheme",
  );

  if (appTheme) {
    // Add the new items to the AppTheme style
    appTheme.item = appTheme.item || [];
    appTheme.item.push(
      { _: "true", $: { name: "android:windowTranslucentNavigation" } },
      { _: "true", $: { name: "android:windowTranslucentStatus" } },
    );
  }

  return styles;
}

module.exports = function androidStylesPlugin(config) {
  return withAndroidStyles(config, (config) => {
    config.modResults = addTranslucentNavAndStatus(config.modResults);
    return config;
  });
};
