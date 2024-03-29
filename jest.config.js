module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["jest-extended/all", "./jest.setup.ts"],
  coverageDirectory: "reports/coverage/unit",
  testPathIgnorePatterns: ["/dist/", "/node_modules/", "/integration/"],
  collectCoverageFrom: ["src/**/*.ts"],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "<rootDir>/reports/tests",
        outputName: "unit-test-evidence.xml",
      },
    ],
    [
      "./node_modules/jest-html-reporter",
      {
        outputPath: "reports/requirements-evidence.html",
      },
    ],
  ],
};
