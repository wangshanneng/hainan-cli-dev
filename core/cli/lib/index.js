"use strict";

module.exports = core;

const path = require("path");
const color = require("colors/safe");
const semver = require("semver");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;

const constant = require("./const");
const log = require("@hainan-cli-dev/log");

const pkg = require("../package.json");

const LOWEST_NODE_VERSION = "12.0.0";
let args;

async function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
    checkEnv();
    await checkGlobalUpdate();
  } catch (error) {
    log.error(error.message);
  }
}

// 检查是否需要全局更新
async function checkGlobalUpdate() {
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const { getNpmSemverVersion } = require("@hainan-cli-dev/get-npm-info");
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      color.yellow(
        `请手动更新 ${npmName}, 当前版本: ${currentVersion}, 最新版本: ${lastVersion} , 更新命令: npm install -g ${npmName}`
      )
    );
  }
}

// 检查环境
function checkEnv() {
  // 作用是从一个名为 .env 的文件中加载环境变量到 Node.js 的 process.env 对象中
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig();
  log.verbose("环境变量", process.env.CLI_HOME_PATH);
}

// 默认的配置
function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }

  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

// 检查入参
function checkInputArgs(params) {
  const minimist = require("minimist");
  args = minimist(process.argv.slice(2));
  checkArgs();
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose";
  } else {
    process.env.LOG_LEVEL = "info";
  }

  log.level = process.env.LOG_LEVEL;
}

// 检查用户名
function checkUserHome() {
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
