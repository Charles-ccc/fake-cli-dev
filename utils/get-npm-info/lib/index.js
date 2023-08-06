'use strict';

const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

async function getNpmInfo(npmName, registry) {
  if (!npmName) return null
  const registryUrl = registry || getDefaultRegistry()
  const npmInfoUrl = urlJoin(registryUrl, npmName)
  return axios.get(npmInfoUrl).then(res => {
    if (res.status !== 200) return null
    return res.data
  }).catch(err => {
    return Promise.reject(err)
  })
  console.log('npmInfoUrl=>', npmInfoUrl);
}

/** isOriginal 是否原生路径 */
function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

/** 获取所有版本号 */
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if (!data) return []
  return Object.keys(data.versions) 
}

/** 获取所有满足条件的版本号 */
function getSemverVersions(baseVersion, versions) {
  return versions
    // 获取大于等于当前版本
    .filter(version => semver.satisfies(version, `^${baseVersion}`))
    // 手动排倒序一次，确保返回顺序
    .sort((a, b) => semver.gt(b, a))
}


async function getNpmSemverVersions(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const lastVersion = getSemverVersions(baseVersion, versions)
  if (lastVersion && lastVersion.length > 0) {
    return lastVersion[0]
  }
}

module.exports = { getNpmInfo, getNpmVersions, getSemverVersions, getNpmSemverVersions };
