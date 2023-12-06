const fs = require('fs')
const path = require('path')
const request = require('request')
const compressing = require('compressing')
// 工程模板目录
const hosProjectDir = '../template/AdvancedTemplete'
// 工程模板存放目录
const hosDir = '../template'
// 工程模板版本号存放目录
const hosVersion = '../template/version.json'
// 工程模板zip包名
const hosZip = 'hos-project.zip'
// TODO 请求地址待修改
// 下载文件地址
const fileUrl = 'http://10.164.172.27:280/hos-project.zip'
// 远程版本地址
const versionUrl = 'http://10.164.172.27:280/version.json'

/**
 *
*  hosProjectDir 本地模板工程目录 先检查模板工程是否存在
*/
const checkHosDirExist = () => {
  if (fs.existsSync(path.join(__dirname, hosProjectDir))) {
    return 1
  } else {
    return 0
  }
}

/**
 *
*  hosVersion 本地模板工程版本号 先检查模板版本号是否存在
*/
const checkHosVersion = () => {
  if (fs.existsSync(path.join(__dirname, hosVersion))) {
    return 1
  } else {
    return 0
  }
}

/**
 *
*  hosVersion 本地模板工程版本号 先检查模板版本号是否存在
*/
const getHosVersion = () => {
  const stream = fs.createWriteStream(path.join(__dirname, hosVersion))
  request(versionUrl).pipe(stream).on('close', function (err) {
    if (err) {
      throw err
    }
    console.log('version.json update success!')
  })
}

/**
 *
 * @params  获取旧版本号
 */
const getOldVersion = () => {
  const projectPath = path.join(__dirname, hosVersion)
  const packageJsonStr = fs.readFileSync(projectPath).toString()
  const packageJson = JSON.parse(packageJsonStr)
  return packageJson.version
}

/**
*
* @params version是版本号，将版本号处理成数组
*/
const handleVersion = (version) => {
  if (version) {
    const versionArr = version.split('.')
    let versionSubArr = []
    versionArr.forEach((key, index) => {
      if (key.search('-') !== -1) {
        versionSubArr = key.split('-')
        versionArr.splice(index, 1)
      }
    })
    versionSubArr.forEach((key) => {
      versionArr.push(key)
    })
    return versionArr
  } else {
    console.log('Version is not exist!')
    return 0
  }
}

/**
 *
 * @params  获取新版本号 再检查版本号是否是最新
 */
const checkVersion = (fileUrl, hosZip, hosDir) => {
  request(versionUrl, (err, response, body) => {
    if (err) {
      console.log(err)
      return 0
    } else {
      const newVersion = JSON.parse(body).version
      const oldVersion = getOldVersion()
      const newVersionArr = handleVersion(newVersion)
      const oldVersionArr = handleVersion(oldVersion)
      if (newVersionArr[0] > oldVersionArr[0] || newVersionArr[1] > oldVersionArr[1] || newVersionArr[2] > oldVersionArr[2]) {
        hosdownload(fileUrl, hosZip, hosDir)
        console.log('Current version is not the latest!')
      } else {
        console.log('Current version is the latest, do not update!')
        return 0
      }
    }
  })
}

/**
 *
* @params url工程文件地址
* @params dir本地存放工程的路径
* @params fileName本地工程的文件名
*/
const hosdownload = (fileUrl, hosZip, hosDir) => {
  const stream = fs.createWriteStream(path.join(__dirname, `${hosDir}/${hosZip}`))
  request(fileUrl).pipe(stream).on('close', function (err) {
    if (err) {
      throw err
    } else {
      console.log(hosZip + ' download success!')
      unzipFile(hosZip)
    }
  })
}

/**
 *
* @params fileUrl工程文件地址
* @params hosDir本地存放工程的路径
* @params hosZip工程的包名
*/
const downloadHosProject = (fileUrl, hosZip, hosDir) => {
  if (!fs.existsSync(path.join(__dirname, hosDir))) {
    fs.mkdirSync(path.join(__dirname, hosDir))
  }
  // 模板工程 存在 1 判断版本号文件是否存在
  // 不存在 0 直接下载
  const isHosDirExist = checkHosDirExist()
  const isHosVersion = checkHosVersion()
  if (isHosDirExist) {
    // 版本号文件 存在 1 比较版本号
    // 不存在 0 直接下载
    if (isHosVersion) {
      // 是否最新版本
      checkVersion(fileUrl, hosZip, hosDir)
    } else {
      getHosVersion()
    }
  } else {
    hosdownload(fileUrl, hosZip, hosDir)
  }
}

/**
 *
* @params hosZip工程的包名
*/
const unzipFile = async (hosZip) => {
  const unzipPath = await path.join(__dirname, '../template/' + hosZip)
  compressing.zip.uncompress(unzipPath, path.join(__dirname, '../template'))
    .then(() => {
      console.log(hosZip, 'unzip success!')
      // 解压完成后删除zip文件
      fs.unlink(unzipPath, err => {
        if (err) {
          throw err
        }
      })
      getHosVersion()
    })
    .catch(err => {
      console.error('unzip', err)
    })
}

downloadHosProject(fileUrl, hosZip, hosDir)
