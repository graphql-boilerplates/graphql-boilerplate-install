import * as fs from 'fs'
import * as npmrun from 'npm-run'

export function replaceInFiles(filePaths: string[], searchValue: string, replaceValue: string) {
  for (const filePath in filePaths) {
    replaceInFile(filePath, searchValue, replaceValue)
  }
}

export function replaceInFile(filePath: string, searchValue: string, replaceValue: string) {
  const contents = fs.readFileSync(filePath, 'utf8')
  const newContents = contents.replace(new RegExp(searchValue, 'g'), replaceValue)
  fs.writeFileSync(filePath, newContents)
}

export function spawn(cmd: string, args: string[], options?: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = ''
    const cp = npmrun.spawn(cmd, args, options)
    if (options.stdio === 'pipe') {
        cp.stdout.on('data', data => {
        buffer += data.toString()
      })
      cp.stderr.on('data', data => {
        buffer += data.toString()
      })
      cp.on('error', err => {
        if (buffer.length > 0) {
          reject(buffer)
        } else {
          reject(err)
        }
      })
    }
    cp.on('close', code => {
      if (code === 0) {
        resolve(buffer)
      } else {
        reject(buffer)
      }
    })
  })
}
