"use strict";

module.exports = core;

const path = require("path");
const color = require("colors/safe");
const semver = require("semver");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const commander = require("commander");

const log = require("@hainan-cli-dev/log");
const init = require("@hainan-cli-dev/init");
const exec = require("@hainan-cli-dev/exec");

const constant = require("./const");
const pkg = require("../package.json");

const program = new commander.Command();

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (error) {
    log.error(error.message);
  }
}

// 命令注册
function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-tp, --targetPath <targetPath>", "是否指定本地调试文件路径", "");

  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化项目")
    .action(exec);

  // 监听debug模式
  program.on("option:debug", function () {
    if (program.debug) {
      process.env.LOG_LEVEL = "verbose";
    } else {
      process.env.LOG_LEVEL = "info";
    }
    log.level = process.env.LOG_LEVEL;
  });

  // 监听targetPath
  program.on("option:targetPath", function () {
    process.env.CLI_TARGET_PATH = program.targetPath;
  });

  // 未知命令监听
  program.on("command:*", function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    log.error(
      color.red("未知的命令：" + obj[0]),
      color.red("可用命令：" + availableCommands.join(","))
    );
  });

  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }
}

// 准备阶段方法
async function prepare(params) {
  checkPkgVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  await checkGlobalUpdate();
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


// 检查版本号
function checkPkgVersion() {
  log.notice("cli", pkg.version);
}
