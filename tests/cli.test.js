const { execSync } = require("child_process");

/**
 * Programmatically set arguments and execute the CLI script
 *
 * @param {...string} args
 */
const testLint = (args) => {
  return execSync(`node build/cli.js lint ${args}`).toString();
};

describe("cli", () => {
  let originalArgv;

  beforeEach(() => {
    // Remove all cached modules. The cache needs to be cleared before running
    // each command, otherwise you will see the same results from the command
    // run in your first test in subsequent tests.
    jest.resetModules();

    originalArgv = process.argv;
  });

  afterEach(() => {
    jest.resetAllMocks();

    process.argv = originalArgv;
  });

  it("should run lint command", async () => {
    const consoleSpy = jest.spyOn(console, "log");

    const testResult = testLint("./tests/fixtures/testSpec.yaml");

    expect(testResult).toContain("[\n  {\n    code: 'openApiFields',");
  });
});
