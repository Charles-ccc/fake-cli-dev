'use strict';

module.exports = core;

const pkg = require('../package.json')
const log = require('@fake-cli-dev/log')


function core() {
  console.log('Hello from core')
  checkPkgVersion()
}

// 检查版本号
function checkPkgVersion() {
  log.info('cli', pkg.version)
}