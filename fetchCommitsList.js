#!/usr/bin/env node

import {
  parseArgs
} from "node:util";

import fs from "node:fs";
import path from "node:path";

// parse CLI arguments
export const options = {
  repository: {
    type: "string",
  },
  baseTag: {
    type: "string",
  },
  tag: {
    type: "string",
  },
  output: {
    type: "string",
  },
};

const {
  repository,
  baseTag,
  tag
} = parseArgs({
  options
}).values;

console.log(`Fetching commits for ${repository} between ${baseTag} and ${tag}...`);

const githubQuery = `https://api.github.com/repos/${repository}/compare/${baseTag}...${tag}`;

const githubResponse = await fetch(githubQuery);
const githubResponseJson = await githubResponse.json();

let JDK_ISSUES = [];

for (const commit of githubResponseJson.commits) {

  let commitLines = commit.commit.message.split("\n");

  commitLines.forEach(line => {
    if (isJDKIssue(line)) {
      JDK_ISSUES.push({
        "id": "JDK-" + line.split(":")[0],
        "commit": commit.sha,
        "title": line
      });
    }
  });
}

function isJDKIssue(line) {
  const regexp = new RegExp(/^[0-9]+:/);
  return regexp.test(line);
}

fs.writeFileSync(path.resolve(process.cwd(), `${tag}-commits.json`), JSON.stringify(JDK_ISSUES, null, 2));