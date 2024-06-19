import type { Config } from "jest";

const config: Config = {
  verbose: true,
  maxWorkers: 2,
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["<rootDir>/src/**/*.spec.ts"],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.service.ts",
    "<rootDir>/src/**/*.controller.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text-summary", "text"],
  rootDir: ".",
  transform: { "^.+\\.(ts)$": "ts-jest" },
};

export default config;
