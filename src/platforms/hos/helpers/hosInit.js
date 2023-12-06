const fs = require('fs')
const path = require('path')
const TAG = '[HOS]'
if (!process.argv[2]) {
  console.error(TAG, 'Bundle name is invadlid!')
  return 0
}

if (!process.argv[3]) {
  console.error(TAG, 'Hos project path is invadlid!')
  return 0
}

if (!process.argv[4]) {
  console.error(TAG, 'Hos project name is invalid!')
  return 0
}
const bundleName = process.argv[2]
const instancePath = process.argv[3]
const projectName = process.argv[4]
const sourcePath = path.join(__dirname, '../template/AdvancedTemplete')
const projectPath = path.join(`${instancePath}/${projectName}`)

try {
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath)
  }
  fs.accessSync(projectPath)
} catch (error) {
  console.error(TAG, 'Hos project path can not be read!')
  console.error(error)
  return 0
}
const copyDir = (sourcePath, projectPath, callback) => {
  const copy = (source, target) => {
    // 创建目标文件夹
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target)
    }

    fs.readdirSync(source).forEach((file) => {
      const sourcePath = path.join(source, file)
      const targetPath = path.join(target, file)
      const stat = fs.statSync(sourcePath)

      if (stat.isFile()) {
        fs.copyFileSync(sourcePath, targetPath)
      } else if (stat.isDirectory()) {
        copy(sourcePath, targetPath)
      }
    })
  }

  fs.access(projectPath, (err) => {
    if (err) {
      fs.mkdirSync(projectPath, { recursive: true })
    }
    copy(sourcePath, projectPath)
    callback()
  })
}

// 更新包名
const upDateBundleName = (bundleName) => {
  const projectCopyPath = path.join(`${projectPath}/AppScope/app.json5`)
  const packageJsonStr = fs.readFileSync(projectCopyPath).toString()
  const packageJson = JSON.parse(packageJsonStr)
  packageJson.app.bundleName = bundleName
  fs.writeFileSync(projectCopyPath, JSON.stringify(packageJson, null, '\t'))
  console.log('Bundle name update success!')
}

// 复制文件夹
copyDir(sourcePath, projectPath, (err) => {
  if (err) {
    console.error(TAG, 'Copy file to hos project fail!')
    console.error(err)
  } else {
    console.info(TAG, 'Copy file to hos project success')
    upDateBundleName(bundleName)
  }
})
