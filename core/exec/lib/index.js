"use strict";

const Package = require("@hainan-cli-dev/package");
const log = require("@hainan-cli-dev/log");

const SETTINGS = {
  init: "@hainan-ci-dev/init",
};

function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose("targetPath", targetPath);
  log.verbose("homePath", homePath);

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";

  if (!targetPath) {
    // 生成缓存路径
    targetPath = "";
  }

  const pkg = new Package({
    targetPath,
    packageName,
    packageVersion,
  });

  console.log('入口文件路径：', pkg.getRootFilePath());
}

module.exports = exec;
