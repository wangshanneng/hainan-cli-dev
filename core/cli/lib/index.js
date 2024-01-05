"use strict";

module.exports = core;

const color = require("colors/safe");
const semver = require("semver");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;

const log = require("@hainan-cli-dev/log");

const pkg = require("../package.json");

const LOWEST_NODE_VERSION = "12.0.0";

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
  } catch (error) {
    log.error(error.message);
  }
}

// 检查用户名
function checkUserHome() {
  console.log(userHome);
  if (!userHome || !pathExists(userHome)) {
    throw new Error(color.red("当前登录用户主目录不存在！"));
  }
}

// 检查Root账户
function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}

// 检查Node版本号
function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestVersion = LOWEST_NODE_VERSION;
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      `hainan-cli-dev 需要安装 v${lowestVersion} 以上版本的 Node.js`
    );
  }
}

// 检查版本号
function checkPkgVersion() {
  log.notice("cli", pkg.version);
}
