const fs = require('fs')
const path = require('path')
const TAG = '[HOS]'
if (!process.argv[2]) {
  console.error(TAG, 'Source directory is invadlid!')
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
const src = process.argv[2]
const instancePath = process.argv[3]
const projectName = process.argv[4]
const rawfilePath = path.join(instancePath, projectName, 'entry', 'src', 'main', 'resources', 'rawfile', '')
try {
  fs.accessSync(src)
} catch (error) {
  console.error(TAG, 'Source directory can not be read!')
  console.error(error)
  return 0
}

try {
  fs.accessSync(rawfilePath)
} catch (error) {
  console.error(TAG, 'Hos project rawfile path can not be read!')
  console.error(error)
  return 0
}

const copyDir = (src, dest, callback) => {
  const copy = (copySrc, copyDest) => {
    fs.readdir(copySrc, (err, list) => {
      if (err) {
        callback(err)
        return
      }
      list.forEach((item) => {
        const ss = path.resolve(copySrc, item)
        fs.stat(ss, (err, stat) => {
          if (err) {
            callback(err)
          } else {
            const curSrc = path.resolve(copySrc, item)
            const curDest = path.resolve(copyDest, item)

            if (stat.isFile()) {
              fs.createReadStream(curSrc).pipe(fs.createWriteStream(curDest))
            } else if (stat.isDirectory()) {
              fs.mkdirSync(curDest, { recursive: true })
              copy(curSrc, curDest)
            }
          }
        })
      })
    })
  }

  fs.access(dest, (err) => {
    if (err) {
      fs.mkdirSync(dest, { recursive: true })
    }
    copy(src, dest)
    callback()
  })
}

copyDir(src, rawfilePath, (err) => {
  if (err) {
    console.error(TAG, 'Copy file to hos project fail!')
    console.error(err)
  } else {
    console.info(TAG, 'Copy file to hos project success')
  }
})
