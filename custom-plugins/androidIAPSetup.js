const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function modifyRootBuildGradle(contents) {
  // Check if supportLibVersion is already defined
  if (!contents.includes("supportLibVersion")) {
    // Find the ext block and add supportLibVersion
    return contents.replace(
      /ext\s*{/,
      `ext {
        supportLibVersion = "28.0.0"`,
    );
  }
  return contents;
}

function modifyAppBuildGradle(contents) {
  // Check if missingDimensionStrategy is already defined
  if (!contents.includes('missingDimensionStrategy "store", "play"')) {
    // Find the defaultConfig block and add missingDimensionStrategy
    return contents.replace(/defaultConfig\s*{[^}]*}/, (match) => {
      return (
        match.slice(0, -1) +
        '    missingDimensionStrategy "store", "play"\n    }'
      );
    });
  }
  return contents;
}

module.exports = function withCustomAndroidConfig(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      // Modify root build.gradle
      const rootBuildGradlePath = path.join(
        config.modRequest.platformProjectRoot,
        "build.gradle",
      );
      const rootContents = await fs.promises.readFile(
        rootBuildGradlePath,
        "utf8",
      );
      const modifiedRootContents = modifyRootBuildGradle(rootContents);
      await fs.promises.writeFile(rootBuildGradlePath, modifiedRootContents);

      // Modify app/build.gradle
      const appBuildGradlePath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "build.gradle",
      );
      const appContents = await fs.promises.readFile(
        appBuildGradlePath,
        "utf8",
      );
      const modifiedAppContents = modifyAppBuildGradle(appContents);
      await fs.promises.writeFile(appBuildGradlePath, modifiedAppContents);

      return config;
    },
  ]);
};
