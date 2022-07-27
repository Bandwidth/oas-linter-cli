module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "build/commands/.remote.spectral.yaml": [
      "<rootDir>/$1"
    ],
    "build/static/.local.spectral.yaml": [
        "<rootDir>/$1"
    ],
    "tests/fixtures/testSpec.yaml": [
        "<rootDir>/$1",
      ]
  }
};
