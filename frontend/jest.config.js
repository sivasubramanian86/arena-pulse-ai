module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }]
  },
  moduleNameMapper: {
    "^lucide-react$": "<rootDir>/node_modules/lucide-react"
  },
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  collectCoverageFrom: [
    "src/components/**/*.{ts,tsx}"
  ],
  testMatch: [
    "<rootDir>/tests/**/*.test.{ts,tsx}"
  ]
};
