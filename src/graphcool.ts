import * as fs from 'fs'
import { spawn } from './utils'

export async function deploy(silent: boolean) {
  const options = { stdio: silent ? 'pipe' : 'inherit' }

  return spawn('graphcool', ['deploy'], options)
    .then(res => {
      if (!silent) {
        console.log(res)
      }
    })
    .catch(err => console.error(err))
}

export async function writeEnv() {
  return spawn('graphcool', ['info', '--current', '--json'], { stdio: 'pipe'})
  .then(res => {
    const endpointInfo = JSON.parse(res)
    fs.writeFileSync('.env', `\
GRAPHCOOL_SECRET=mysecret123
GRAPHCOOL_STAGE=${endpointInfo.stage}
GRAPHCOOL_CLUSTER=${endpointInfo.cluster}
GRAPHCOOL_ENDPOINT=${endpointInfo.httpEndpoint}`)
  })
  .catch(err => console.error(err))
}
