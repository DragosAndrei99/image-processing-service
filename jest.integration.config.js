const config = require("./jest.config");

module.exports = {
  ...config,
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
  coverageDirectory: "reports/coverage/integration",
  globalSetup: "./integration/jest.setup.js",
  globalTeardown: "./integration/jest.teardown.js",
  coveragePathIgnorePatterns: ["src/server.ts"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  roots: ["<rootDir>/integration/"],
};
