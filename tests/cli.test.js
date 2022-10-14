const { execSync } = require("child_process");

/**
 * Programmatically set arguments and execute the CLI script
 *
 * @param {...string} args
 */
const testLint = (args) => {
  return execSync(`node build/cli.js lint ${args} -j`).toString();
};

const testLintWithLocalRuleset = (args) => {
  return execSync(`node build/cli.js lint ${args} -j -r ${__dirname + "/../src/static/.local.spectral.yaml"}`).toString();
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

  // it("should run lint command using a valid spec", async () => {
  //   expect(true).toBe(true)
  // });

  it("should run lint command using a spec with errors", async () => {
    result = JSON.parse(testLint("./tests/fixtures/testSpec.yaml"));
    testObj = result[1];
    expect(typeof testObj.code).toBe("string");
    expect(typeof testObj.message).toBe("string");
    expect(typeof testObj.path).toBe("object");
    expect(typeof testObj.severity).toBe("number");
    expect(typeof testObj.range).toBe("object");
    expect(typeof testObj.range.start).toBe("object");
    expect(typeof testObj.range.start.line).toBe("number");
    expect(typeof testObj.range.start.character).toBe("number");
    expect(typeof testObj.range.end).toBe("object");
    expect(typeof testObj.range.end.line).toBe("number");
    expect(typeof testObj.range.end.character).toBe("number");
  });

  it("should run lint command using a spec with errors against a local ruleset file", async () => {
    result = JSON.parse(testLintWithLocalRuleset("./tests/fixtures/testSpec.yaml"));
    testObj = result[1];
    expect(typeof testObj.code).toBe("string");
    expect(typeof testObj.message).toBe("string");
    expect(typeof testObj.path).toBe("object");
    expect(typeof testObj.severity).toBe("number");
    expect(typeof testObj.range).toBe("object");
    expect(typeof testObj.range.start).toBe("object");
    expect(typeof testObj.range.start.line).toBe("number");
    expect(typeof testObj.range.start.character).toBe("number");
    expect(typeof testObj.range.end).toBe("object");
    expect(typeof testObj.range.end.line).toBe("number");
    expect(typeof testObj.range.end.character).toBe("number");
  });
});
