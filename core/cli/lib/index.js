'use strict';

module.exports = core;

const semver = require('semver')
const colors = require('colors')


const pkg = require('../package.json')
const log = require('@fake-cli-dev/log')
const constant = require('./constants')

function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
  } catch (e) {
    log.error(e.message)
  }
}

// 检查版本号
function checkPkgVersion() {
  log.info('cli', pkg.version)
}

// 检查node版本号
function checkNodeVersion() {
  // 获取当前node版本号，并比对最低版本号
  const currentVersion = process.version
  const lowestNodeVersion = constant.LOWEST_NODE_VERSION
  if (semver.lte(currentVersion, lowestNodeVersion)) {
    throw new Error(colors.red(`fake-cli 需要安装 v${lowestNodeVersion} 以上版本的 Node.js`))
  }
}

// 检查root账户，proces.geteuid() root账户是0
function checkRoot() {
  const rootCheck = require('root-check')
  rootCheck()
}