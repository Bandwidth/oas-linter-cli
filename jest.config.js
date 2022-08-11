module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "^commands/(.*)$": "<rootDir>/build/commands/$1",
    "^static/(.*)$": "<rootDir>/build/static/$1",
    "^tests/fixtures/(.*)$": "<rootDir>/tests/fixtures/$1"
  }
};
