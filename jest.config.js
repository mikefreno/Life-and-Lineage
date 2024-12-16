module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  coveragePathIgnorePatterns: ["node_modules", "assets", "config"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFiles: ["./jest.setup.js"],
};
