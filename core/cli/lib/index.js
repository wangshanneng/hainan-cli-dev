"use strict";

module.exports = core;

const pkg = require("../package.json");
const log = require('@hainan-cli-dev/log');

function core() {
  checkPkgVersion();
}

// 检查版本号
function checkPkgVersion() {
  log.notice("cli", pkg.version);
}
