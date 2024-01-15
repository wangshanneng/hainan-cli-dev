"use strict";

const command = require("@hainan-cli-dev/command");
const log = require("@hainan-cli-dev/log");

class InitCommand extends command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = !!this._cmd.force;
    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }
  exec() {}
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
