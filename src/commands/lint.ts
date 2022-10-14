#!/usr/bin/env node
import axios from "axios";
import type { Arguments } from "yargs";

const fs = require("fs");
const homeDir = require("os").homedir();
const path = require("path");
const util = require("util");
const chalk = require('chalk');
const YAML = require("yaml");
const { fetch } = require("@stoplight/spectral-runtime");
const { Spectral } = require("@stoplight/spectral-core");
const {
  bundleAndLoadRuleset,
} = require("@stoplight/spectral-ruleset-bundler/with-loader");

export const command: string = "lint <specPath>";
export const aliases: string[] = ["l"];
export const desc: string = "Lint an OpenAPI Specification";

const rulesetUrl = "https://bw-linter-ruleset.s3.amazonaws.com/ruleset.yml";
var rulesetFilename = ".remote.spectral.yaml";
var rulesetFilepath = path.join(__dirname, rulesetFilename);

type Options = {
  specPath: string;
  save: boolean;
};

async function downloadRuleset(
  fileUrl: string,
  outputLocationPath: string
): Promise<any> {
  const writer = fs.createWriteStream(outputLocationPath);

  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  }).then((response) => {
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error: any = null;
      writer.on("error", (err: any) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on("close", () => {
        if (!error) {
          resolve(true);
        }
      });
    });
  });
}

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

function deleteRemoteRuleset() {
  try {
    fs.unlinkSync(path.join(__dirname, rulesetFilename));
  } catch (err) {
    console.error(err);
  }
}

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  // Open the provided API Spec
  const { specPath, save, json, ruleset } = argv;
  const specFile = fs.readFileSync(specPath, "utf8");
  const spec = YAML.parse(specFile);
  var specName = path.basename(specPath, path.extname(specPath));

  // attempt to download the ruleset if no local file was provided
  var downloadSuccess;
  if (!ruleset) {
    downloadSuccess = true;
    try {
      await downloadRuleset(rulesetUrl, rulesetFilepath);
    } catch (error) {
      // Error downloading the remote ruleset - use the bundled local copy
      console.warn(chalk.yellow.bold("Failed to download remote ruleset. Using Local Copy."));
      console.log("Note that lint results may vary from production ruleset.");
      rulesetFilename = "./static/.local.spectral.yaml";
      rulesetFilepath = path.join(__dirname, "..", rulesetFilename);
      console.log(rulesetFilepath);
      downloadSuccess = false;
    }
  } else {
    rulesetFilepath = ruleset;
  }

  // Setup Spectral and load ruleset
  const spectral = new Spectral();
  spectral.setRuleset(
    await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch })
  );

  // Run the linter
  var result: Array<Object> = [];
  await spectral.run(spec).then((result: Array<Object>) => {
    if (json) {
      // Print result in JSON format so that it can be parsed programmatically
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
    }
  });

  // save the console output to a .json file in the home directory if -s argument is passed
  if (save) {
    saveResult(specName + "_lint_result.json", homeDir, JSON.stringify(result, null, 4));
  }

  // If ruleset was downloaded successfully - delete it
  if (downloadSuccess) {
    deleteRemoteRuleset();
  }
};
