const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function modifyBuildGradle(contents) {
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

module.exports = function withCustomAndroidConfig(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const buildGradlePath = path.join(
        config.modRequest.platformProjectRoot,
        "build.gradle",
      );
      const contents = await fs.promises.readFile(buildGradlePath, "utf8");
      const modifiedContents = modifyBuildGradle(contents);
      await fs.promises.writeFile(buildGradlePath, modifiedContents);
      return config;
    },
  ]);
};
