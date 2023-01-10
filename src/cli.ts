#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .commandDir("commands")
  .alias({ h: "help" })
  .alias({ v: "version" })
  .example(
    "bw-oas-lint linter ./path/to/my/spec",
    "bw-oas-lint linter ./path/to/my/spec -r ./path/to/my/ruleset -s -j"
  )
  .strict().argv;
