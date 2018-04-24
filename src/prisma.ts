import * as fs from 'fs'
import { spawn } from './utils'
import * as sillyname from 'sillyname'
import { getFastestRegion } from './ping'

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
PRISMA_ENDPOINT=${endpointInfo.httpEndpoint}`,
      )
    })
    .catch(err => console.error(err))
}

export async function makeSandboxEndpoint(project: string) {
  const region = await getFastestRegion()
  return `https://${region}.prisma.sh/public-${getSillyName()}/${project}/dev`
}

function getSillyName() {
  return `${slugify(sillyname()).split('-')[0]}-${Math.round(
    Math.random() * 1000,
  )}`
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}
