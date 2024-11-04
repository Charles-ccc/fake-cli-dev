'use strict';

module.exports = core;

const path = require('path')
const semver = require('semver')
const colors = require('colors')
const userHome = require('user-home')
const pathExists = require('path-exists').sync

const pkg = require('../package.json')
const log = require('@fake-cli-dev/log')
const constant = require('./constants')
const commander = require('commander')

let args;

/** 实例化脚手架对象 */
const program = new commander.Command()

async function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    checkUserHome()
    // checkInputArgs()
    checkEnv()
    await checkGlobalUpdate()
    registerCommander()
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

// 检查用户主目录
function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'))
  }
}

// 检查入参
function checkInputArgs() {
  const minimist = require('minimist')
  args = minimist(process.argv.slice(2))
  checkArgs()
}

function checkArgs() {
  if (args.debug) {
    // debug模式
    process.env.LOG_LEVEL = 'verbose'
  } else {
    process.env.LOG_LEVEL = 'info'
  }
  // 使修改生效
  log.level = process.env.LOG_LEVEL
}

// 检查环境变量
function checkEnv() {
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userHome, '.env')
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath
    })
  }
  createDefaultConfig()
  log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
}

// 检查最新版本更新
async function checkGlobalUpdate() {
  // 1.获取当前版本号和模块名
  const currentVersion = pkg.version
  const npmName = pkg.name
  // 2.调用npm API，获取所有版本号
  const { getNpmSemverVersions } = require('@fake-cli-dev/get-npm-info')
  // 3.提取所有版本号，比对哪些版本号大于当前版本号
  const lastVersion = await getNpmSemverVersions(currentVersion, npmName)
  // 4.获取最新版本号，提示用户更新
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
              更新命令：npm install -g ${npmName}`))
  }
}

// 命令注册
function registerCommander () {
  program
    .usage('<commander> [options]')
    .name(Object.keys(pkg.bin)[0])
    .version(pkg.version)
    .option('-d --debug', '是否开启调试模式', false)
  
  // 是否开启debug模式
  program.on('option:debug', function() {
    if (program.debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  })

  // 是否强制初始化
  program
    .command('init [projectName]')
    .option('-f --force', '是否强制初始化项目')
    .action((projectName, cmdObj) => {
      
    })

  // 未知命令监听
  program.on('command:*', function(obj) {
    const availableCommands = program.commands.map(cmd => cmd.name())
    console.log(colors.red('未知的命令：' + obj[0]))
    if (availableCommands.length > 0) {
      console.log(colors.blue('可用的命令：' + availableCommands.join(',')))
    }
  })
  // 没有输入有效命令时给出帮助
  if (program.args && program.args.length < 1) {
    program.outputHelp()
    console.log()
  }
  program.parse(process.arv);
}