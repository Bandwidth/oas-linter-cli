#!/usr/bin/env node
import axios from "axios";
import type { Arguments } from "yargs";

const fs = require("fs");
const tmp = require("tmp");
const homeDir = require("os").homedir();
const path = require("path");
const util = require("util");
const chalk = require("chalk");
const Parsers = require("@stoplight/spectral-parsers");
const { fetch } = require("@stoplight/spectral-runtime");
const { Spectral, Document } = require("@stoplight/spectral-core");
const {
  bundleAndLoadRuleset,
} = require("@stoplight/spectral-ruleset-bundler/with-loader");

type Options = {
  specPath: string;
  save: boolean;
  json: boolean;
  ruleset: string;
};

interface Result {
  code: string;
  message: string;
  path: Array<string>;
  severity: number;
  source: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

const tmpRulesetFile = tmp.fileSync({ postfix: ".js" });
const RULESET_URL = "https://bw-linter-ruleset.s3.amazonaws.com/ruleset.js";

const downloadRemoteRuleset = async () => {
  const response = await axios({
    method: "get",
    url: RULESET_URL,
  });

  // Check for failure response
  if (response.status != 200) {
    console.error(`Failed to retrieve ruleset from AWS.`);
    return false;
  }

  try {
    fs.writeFileSync(tmpRulesetFile.name, response.data);
    return true;
  } catch (err) {
    // If there is an issue writing, default to local
    console.error(`Failed to write ruleset to file, error: ${err}`);
    return false;
  }
};

function saveResult(resultFilename: string, homeDir: string, result: Object) {
  try {
    const data = JSON.stringify(result, null, 4);
    fs.writeFileSync(path.join(homeDir, resultFilename), data);
    console.log("Results saved to", homeDir + "/" + resultFilename);
  } catch (error) {
    console.error(chalk.red.bold("Error saving file to home directory"));
    console.error(error);
  }
}

exports.command = "lint <specPath>";
exports.aliases = ["l"];
exports.describe = "Lint an OpenAPI Specification";
exports.builder = {
  save: {
    type: "boolean",
    describe: "Save result to users home directory",
    alias: "s",
  },
  json: {
    type: "boolean",
    describe: "Output result as json",
    alias: "j",
  },
  ruleset: {
    type: "string",
    describe: "Path to alternative ruleset",
    alias: "r",
  },
};

exports.handler = async (argv: Arguments<Options>): Promise<void> => {
  // Open the provided API Spec
  const { specPath, save, json, ruleset } = argv;
  const specFile = fs.readFileSync(specPath, "utf8");
  let specName = path.basename(specPath, path.extname(specPath));
  let rulesetFilepath;

  // Attempt to download the ruleset if no local file was provided
  if (!ruleset) {
    const downloadSuccess = await downloadRemoteRuleset();
    if (downloadSuccess) {
      // Use the downloaded ruleset
      rulesetFilepath = tmpRulesetFile.name;
    } else {
      // Error downloading the remote ruleset - use the bundled local copy
      console.warn(
        chalk.yellow.bold(
          "Failed to download remote ruleset. Using Local Copy."
        )
      );
      console.log("Note that lint results may vary from production ruleset.");
      const rulesetFilename = "./static/.local.ruleset.js";
      rulesetFilepath = path.join(__dirname, "..", rulesetFilename);
      console.log(rulesetFilepath);
    }
  } else {
    // Use the provided ruleset
    rulesetFilepath = ruleset;
  }

  // Setup Spectral and load ruleset
  const spectral = new Spectral();
  spectral.setRuleset(
    await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch })
  );
  spectral.set;

  // Run the linter
  await spectral
    .run(new Document(specFile, Parsers.Yaml, specPath))
    .then((result: Array<Result>) => {
      result.forEach((res) => {
        res.range.start.line += 1;
        res.range.end.line += 1;
      });
      if (json) {
        // Print result in JSON format so that it can be parsed programmatically
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(
          util.inspect(result, { showHidden: false, depth: null, colors: true })
        );
      }
      // save the console output to a .json file in the home directory if -s argument is passed
      if (save) {
        saveResult(specName + "_lint_result.json", homeDir, result);
      }
    });
};
