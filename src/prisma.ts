import * as fs from 'fs'
import { spawn } from './utils'

export async function deploy(silent: boolean) {
  const options = { stdio: silent ? 'pipe' : 'inherit' }

  return spawn('prisma', ['deploy'], options)
    .then(res => {
      if (!silent) {
        console.log(res)
      }
    })
    .catch(err => console.error(err))
}

export async function getInfo(): Promise<any> {
  return spawn('prisma', ['info', '--current', '--json'], { stdio: 'pipe' })
    .then(res => JSON.parse(res))
    .catch(err => console.error(err))
}

export async function writeEnv() {
  return spawn('prisma', ['info', '--current', '--json'], { stdio: 'pipe' })
    .then(res => {
      const endpointInfo = JSON.parse(res)
      fs.writeFileSync(
        '.env',
        `\
PRISMA_SECRET=${endpointInfo.secret}
PRISMA_STAGE=${endpointInfo.stage}
PRISMA_CLUSTER=${endpointInfo.cluster}
PRISMA_ENDPOINT=${endpointInfo.httpEndpoint}`,
      )
    })
    .catch(err => console.error(err))
}
