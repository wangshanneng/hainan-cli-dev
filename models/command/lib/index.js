"use strict";

const semver = require("semver");
const colors = require("colors/safe");

const log = require("@hainan-cli-dev/log");

const LOWEST_NODE_VERSION = "12.0.0";

class Command {
  constructor(argv) {
    log.verbose("Command constructor", argv);
    if (!argv) {
      throw new Error("参数不能为空");
    }
    if (!Array.isArray(argv)) {
      throw new Error("参数必须为数组");
    }
    if (argv.length < 1) {
      throw new Error("参数列表为空");
    }
    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain.catch((err) => {
        log.error(err.message);
      });
    });
  }

  // 检查Node版本号
  checkNodeVersion() {
    const currentVersion = process.version;
    const lowestVersion = LOWEST_NODE_VERSION;
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(
        `hainan-cli-dev 需要安装 v${lowestVersion} 以上版本的 Node.js`
      );
    }
  }

  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }

  init() {
    // 强制父类实现 否则抛出异常
    throw new Error("init 必须实现");
  }

  exec() {
    throw new Error("exec 必须实现");
  }
}

module.exports = Command;
