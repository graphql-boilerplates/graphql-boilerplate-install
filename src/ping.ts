import * as fetch from 'node-fetch'
import HttpProxyAgent from 'http-proxy-agent'
export type Region = 'EU_WEST_1' | 'US_WEST_2'

const regionMap = {
  EU_WEST_1: 'eu1',
  US_WEST_2: 'us1',
}

async function runPing(url: string): Promise<number> {
  const pingUrl = async () => {
    const start = Date.now()

    if (process.env.NODE_ENV !== 'test') {
      if (process.env.HTTP_PROXY) {
        await fetch(url, { agent:new HttpProxyAgent(process.env.HTTP_PROXY)})
      } else {
        await fetch(url)
      }
    }

    return Date.now() - start
  }
  const pings = await Promise.all([0, 0].map(pingUrl))

  return sum(pings) / pings.length
}

export const regions: Region[] = ['EU_WEST_1', 'US_WEST_2']

export async function getFastestRegion(): Promise<string> {
  const pingResults = await Promise.all(
    regions.map(async (region: Region) => {
      const ping = await runPing(getPingUrl(region))
      return {
        region,
        ping,
      }
    }),
  )

  const fastestRegion: { region: Region; ping: number } = pingResults.reduce(
    (min, curr) => {
      if (curr.ping < min.ping) {
        return curr
      }
      return min
    },
    { region: 'EU_WEST_1', ping: Infinity },
  )

  return regionMap[fastestRegion.region]
}

export const getDynamoUrl = (region: string) =>
  `http://dynamodb.${region.toLowerCase().replace(/_/g, '-')}.amazonaws.com`

const getPingUrl = (region: string) =>
  `${getDynamoUrl(region)}/ping?x=${randomString()}`

function sum(arr) {
  return arr.reduce((acc, curr) => acc + curr, 0)
}

function randomString() {
  return Math.random()
    .toString(36)
    .substring(7)
}
