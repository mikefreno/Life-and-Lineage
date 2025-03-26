const {
  withAndroidManifest,
  withEntitlementsPlist,
} = require("@expo/config-plugins");

const withCustomPermissions = (config) => {
  // Add Android billing permission
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Add billing permission if it doesn't exist
    if (!androidManifest.manifest["uses-permission"]) {
      androidManifest.manifest["uses-permission"] = [];
    }

    const permissions = androidManifest.manifest["uses-permission"];
    const hasBillingPermission = permissions.some(
      (permission) =>
        permission.$?.["android:name"] === "com.android.vending.BILLING",
    );

    if (!hasBillingPermission) {
      permissions.push({
        $: {
          "android:name": "com.android.vending.BILLING",
        },
      });
    }

    return config;
  });

  // Add iOS In-App Purchase capability
  config = withEntitlementsPlist(config, (config) => {
    if (!config.modResults) {
      config.modResults = {};
    }
    console.log(config.ios.entitlements);

    return config;
  });

  return config;
};

module.exports = withCustomPermissions;
