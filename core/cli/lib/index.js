"use strict";

module.exports = core;

const pkg = require("../package.json");
const semver = require("semver");
const log = require('@hainan-cli-dev/log');

const LOWEST_NODE_VERSION = '12.0.0';

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
  } catch (error) {
    log.error(error.message);
  }
}

// 检查Node版本号
function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestVersion = LOWEST_NODE_VERSION;
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      `hainan-cli-dev 需要安装 v${lowestVersion} 以上版本的 Node.js`
    )
  }
}

// 检查版本号
function checkPkgVersion() {
  log.notice("cli", pkg.version);
}
