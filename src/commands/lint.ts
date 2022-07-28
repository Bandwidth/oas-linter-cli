#!/usr/bin/env node
import axios from "axios";
import type { Arguments } from "yargs";

const fs = require("fs");
const homeDir = require("os").homedir();
const path = require("path");
const util = require("util");
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
    console.error("Error saving file to home directory");
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
  const { specPath, save } = argv;
  const specFile = fs.readFileSync(specPath, "utf8");
  const spec = YAML.parse(specFile);

  // attempt to download the ruleset
  try {
    await downloadRuleset(rulesetUrl, rulesetFilepath);
    var downloadSuccess = true;
  } catch (error) {
    // Error downloading the remote ruleset - use the bundled local copy
    console.warn("Failed to download remote ruleset. Using Local Copy.");
    console.log("Note that lint results may vary from production ruleset.");
    rulesetFilename = "./static/.local.spectral.yaml";
    rulesetFilepath = path.join(__dirname, "..", rulesetFilename);
    console.log(rulesetFilepath);

    var downloadSuccess = false;
  }

  // Setup Spectral and load ruleset
  const spectral = new Spectral();
  spectral.setRuleset(
    await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch })
  );

  // Run the linter
  var result: Object = {};
  await spectral.run(spec).then((res: any) => {
    result = res;
    console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
  });

  // save the console output to a .json file in the home directory if -s argument is passed
  if (save) {
    saveResult("lint_result.json", homeDir, result);
  }

  // If ruleset was downloaded successfully - delete it
  if (downloadSuccess) {
    deleteRemoteRuleset();
  }
};
