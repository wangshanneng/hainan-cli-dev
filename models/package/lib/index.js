"use strict";

const path = require("path");
const pkgDir = require("pkg-dir");
const npminstall = require("npminstall");

const { isObject } = require("@hainan-cli-dev/utils");
const formatPath = require("@hainan-cli-dev/format-path");
const { getDefaultRegistry } = require("@hainan-cli-dev/get-npm-info");

class Package {
  constructor(options) {
    if (!options) {
      throw new Error("Package 类的参数不能为空");
    }
    if (!isObject(options)) {
      throw new Error("Package 类的参数必须是对象");
    }
    // package 目标路径
    this.targetPath = options.targetPath;
    // 缓存package的路径
    this.storeDir = options.storeDir;
    // package 的名称
    this.packageName = options.packageName;
    // package 的版本
    this.packageVersion = options.packageVersion;
  }

  // package 是否存在
  exists() {}

  // 安装package
  install() {
    npminstall({
      root: this.targetPath,
      stroDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }

  // 更新packege
  update() {}

  // 获取入口文件的路径
  getRootFilePath() {
    // 1. 获取package.json所在目录
    const dir = pkgDir.sync(this.targetPath);

    //2. 读取package.json
    if (dir) {
      const pkgFile = require(path.resolve(dir, "package.json"));
      // 3. 寻找main/lib
      if (pkgFile && pkgFile.main) {
        // 4. 路径的兼容（macOS/windows）
        return formatPath(path.resolve(dir, pkgFile.main));
      }
    }

    return null;
  }
}

module.exports = Package;
