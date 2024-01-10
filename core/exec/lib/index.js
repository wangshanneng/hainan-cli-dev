"use strict";

const path = require("path");

const Package = require("@hainan-cli-dev/package");
const log = require("@hainan-cli-dev/log");

const SETTINGS = {
  init: "@hainan-cli-dev/init",
};

const CACHE_DIR = "dependencies";

function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = "";
  let pkg;

  log.verbose("targetPath", targetPath);
  log.verbose("homePath", homePath);

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
    storeDir = path.resolve(targetPath, "node_modules");

    log.verbose("targetPath", targetPath);
    log.verbose("storeDir", storeDir);

    // 目标路径不存在的时候做的逻辑
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });

    if (pkg.exists()) {
      // 更新package
    } else {
      // 安装package
      pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }

  const rootFile = pkg.getRootFilePath();

  require(rootFile).apply(null, arguments);

  console.log("入口文件路径：", pkg.getRootFilePath());
}

module.exports = exec;
