# oas-linter-cli

This is a CLI tool that enables users to run an OAS (Open API Spec) file through the DevX ruleset before opening a pull request against [api-specs](https://github.com/Bandwidth/api-specs)

## Setup and Install

```sh
# if your npm profile isnt setup to download npm packages published to githubs npm registry - run these commands first
npm login --registry https://npm.pkg.github.com    # Requires a github token with Bandwidth SSO access
npm config set @Bandwidth:registry https://npm.pkg.github.com

npm install -g @Bandwidth/oas-linter-cli
```

## Usage

```sh
bw-oas-lint -h    # Help
bw-oas-lint lint ../path/to/my/spec.yml    # must be in Yaml format

# add -s flag to save the terminal output to a .json file in your home directory
```
