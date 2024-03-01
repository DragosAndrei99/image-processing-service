module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["jest-extended/all", "./jest.setup.ts"],
  coverageDirectory: "reports/coverage/unit",
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
  collectCoverageFrom: ["src/**/*.ts"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
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
