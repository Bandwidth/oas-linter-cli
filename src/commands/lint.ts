import axios from "axios";
import type { Arguments } from "yargs";

const fs = require("fs");
const homeDir = require('os').homedir();
const path = require("path");
const util = require('util');
const YAML = require('yaml');
const { fetch } = require("@stoplight/spectral-runtime");
const { Spectral } = require("@stoplight/spectral-core");
const { bundleAndLoadRuleset } = require("@stoplight/spectral-ruleset-bundler/with-loader");

export const command: string = "lint <specPath>";
export const aliases: string[] = ['l'];
export const desc: string = "Lint an OpenAPI Specification";

const rulesetUrl = "https://bw-linter-ruleset.s3.amazonaws.com/ruleset.yml";
var rulesetFilename = ".remote.spectral.yaml"
var rulesetFilepath = path.join(__dirname, rulesetFilename);

type Options = {
  specPath: string;
  s: boolean;
};

async function downloadRuleset(fileUrl: string, outputLocationPath: string): Promise<any> {
    const writer = fs.createWriteStream(outputLocationPath);

    return axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then(response => {
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error: any = null;
        writer.on('error', (err: any) => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) {
            resolve(true);
          }
        });
      });
    });
}

function deleteRemoteRuleset() {
    try {
        fs.unlinkSync(path.join(__dirname, rulesetFilename))
      } catch(err) {
        console.error(err)
      }
}

export const handler = async (argv: Arguments<Options>): Promise<void> => {  
  // Open the provided API Spec 
  const { specPath, save } = argv;
  const specFile = fs.readFileSync(specPath, 'utf8');
  const spec = YAML.parse(specFile);

  // attempt to download the ruleset
  try {
    await downloadRuleset(rulesetUrl, path.join(__dirname, rulesetFilename));
    var downloadSuccess = true;
  } catch (error) {
    // Error downloading the remote ruleset - use the bundled local copy
    console.warn("Failed to download remote ruleset. Using Local Copy.")
    console.log("Note that lint results may vary from production ruleset.")
    rulesetFilename = "static/.local.spectral.yaml";
    rulesetFilepath = path.join(__dirname, '..', rulesetFilename);
    downloadSuccess = false;
  }
  
  // Setup Spectral
  const spectral = new Spectral();
  spectral.setRuleset(await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }));
 
  // Run the linter
  const result = await spectral.run(spec);
  console.log(util.inspect(result, {showHidden: false, depth: null, colors: true}))
  
  // save the console output to a .json file in the home directory if -s argument is passed
  if (save) {
    const resultFilename = "lint_result.json";
    const data = JSON.stringify(result, null, 4);
    fs.writeFileSync(path.join(homeDir, resultFilename), data);
    console.log("Results saved to", homeDir + "/" + resultFilename);
  }

  // If ruleset was downloaded successfully - delete it
  if (downloadSuccess) {
    deleteRemoteRuleset();
  }
};
