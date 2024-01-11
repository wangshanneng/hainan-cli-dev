"use strict";

const path = require("path");
const pkgDir = require("pkg-dir").sync;
const npminstall = require("npminstall");
const pathExists = require("path-exists").sync;
const fse = require("fs-extra");

const { isObject } = require("@hainan-cli-dev/utils");
const formatPath = require("@hainan-cli-dev/format-path");
const {
  getDefaultRegistry,
  getNpmLatestVersion,
} = require("@hainan-cli-dev/get-npm-info");

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
    // package 的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace("/", "_");
  }

  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      // 创建路径
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === "latest") {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }

  // package 是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }

  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    );
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`
    );
  }

  // 安装package
  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      stroDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }

  // 更新packege
  async update() {
    await this.prepare();
    console.log("更新");
    // 1. 获取最新的npm模块版本号
    const latestpPackageVersion = await getNpmLatestVersion(this.packageName);
    // 2. 查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestpPackageVersion);
    // 3. 如果不存在，直接安装最新版本
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{ name: this.packageName, version: latestpPackageVersion }],
      });
      // TODO: 注意更新
      this.packageVersion = latestpPackageVersion;
    }
  }

  // 获取入口文件的路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      // 1. 获取package.json所在目录
      const dir = pkgDir(targetPath);

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
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath); // 返回缓存文件路径下的入口文件路径
    } else {
      return _getRootFile(this.targetPath);
    }
  }
}

module.exports = Package;
