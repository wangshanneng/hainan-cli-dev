"use strict";

const cp = require("child_process");
const path = require("path");

const Package = require("@hainan-cli-dev/package");
const log = require("@hainan-cli-dev/log");

const SETTINGS = {
  init: "@hainan-cli-dev/init",
};

const CACHE_DIR = "dependencies";

async function exec() {
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

    if (await pkg.exists()) {
      // 更新package
      pkg.update();
    } else {
      // 安装package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }

  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    try {
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null);
      Object.keys(cmd).forEach((key) => {
        // 原型链
        if (
          cmd.hasOwnProperty(key) &&
          !key.startsWith("_") &&
          key !== "parent"
        ) {
          o[key] = cmd[key];
        }
      });

      args[args.length - 1] = o;

      const code = `require('${rootFile}').call(null,${JSON.stringify(args)})`;

      const child = spawn("node", ["-e", code], {
        cwd: process.cwd(),
        stdio: "inherit",
      });

      child.on("error", (e) => {
        log.error(e.message);
        process.exit(1); // 退出当前进程，并且退出码为1，表示失败。
      });
      child.on("exit", (e) => {
        log.verbose("命令执行成功: ", e);
        process.exit(e);
      });
    } catch (error) {
      log.error(error.message);
    }
  }
}

// windows 兼容
function spawn(command, args, options) {
  const win32 = process.platform === "win32";
  const cmd = win32 ? "cmd" : command;
  const cmdArgs = win32 ? ["/c"].concat(command, args) : args;

  return cp.spawn(cmd, cmdArgs, options || {});
}

module.exports = exec;
