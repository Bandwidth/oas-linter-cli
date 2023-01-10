# oas-linter-cli

This is a CLI tool that enables users to run an OAS (Open API Spec) file through Bandwidth's custom [Stoplight ruleset](https://docs.stoplight.io/docs/spectral/e5b9616d6d50c-rulesets).

## Setup and Install

```sh
npm install -g @bandwidth/oas-linter-cli
```

## Usage

```sh
bw-oas-lint linter ../path/to/my/spec.yml    # json also supported
```

### Options

Run `bw-oas-lint linter -h` for a list of options.

| Flag | Description |
|:----:|:------------|
| -s  | Save linter result to users home directory |
| -j  | Output JSON |
| -r  | Path to custom spectral ruleset file |
| -h  | Print help menu |
| -v  | Print package version |


## Uninstall

```sh
npm uninstall -g @bandwidth/oas-linter-cli
```
