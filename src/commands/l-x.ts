import {Args, Command, Flags} from '@oclif/core'
import fetch from 'node-fetch'

async function getPluginReleases(slug: string) {
  const apiEndpoint = getAPIEndpoint(slug)

  return fetch(apiEndpoint)
  .then(res => res.json())
}

function getAPIEndpoint(slug: string) {
  if (slug === 'wordpress') {
    return 'https://api.wordpress.org/core/version-check/1.7/'
  }

  return `https://api.wordpress.org/plugins/info/1.0/${slug}.json`
}

export default class LatestVersions extends Command {
  static description = 'Get the range of x+1 latest versions of a package'

  static aliases = ['lx', 'latest-x', 'latestversions', 'latest-versions']

  static examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ]

  public static enableJsonFlag = true

  static flags = {
    includeRC: Flags.boolean({char: 'r', aliases: ['rc'], description: 'Whether to include Release Candidates in the fetched versions. (WordPress is Not compatible with this)'}),
    includePatches: Flags.boolean({char: 'p', aliases: ['patches'], description: 'Whether to include Patches in the fetched versions. (WordPress is NOT compatible with this)'}),
  }

  static args = {
    slug: Args.string({description: 'Slug of the extension', default: 'wordpress'}),
    offset: Args.integer({description: 'How far from the latest we should offset', default: 2}),
  }

  async run(): Promise<Array<string>> {
    const {args, flags} = await this.parse(LatestVersions)

    this.log(`Fetching L-${args.offset} version${flags.single ? '' : 's'} ${args.slug}!`)

    const releases = await getPluginReleases(args.slug)
    .then((releases: any) => {
      const slug = args.slug
      const numberOfReleases = args.offset + 1
      const includeRC = flags.includeRC
      const includePatches = flags.includePatches

      const output = []

      if (slug === 'wordpress') {
        for (const release of releases.offers) {
          if (output.length === numberOfReleases) {
            break
          }

          if (
            release.new_files &&
            (includePatches ||
              !isMinorAlreadyAdded(output, release.version))
          ) {
            output.push(release.version)
          }
        }
      } else {
        const versions = Object.keys(releases.versions)
        .filter(
          version =>
            version !== 'trunk' &&
              version !== 'other' &&
              !version.includes('beta'),
        )
        .sort(semverCompare)

        for (const version of versions) {
          const releasesAdded = output.filter(
            release => !isRC(release),
          )

          if (releasesAdded.length === numberOfReleases) {
            break
          }

          if (
            (includeRC || !isRC(version)) &&
            (includePatches || !isMinorAlreadyAdded(output, version))
          ) {
            output.push(version)
          }
        }
      }

      return output
    })

    this.log(JSON.stringify(releases))
    return releases
  }
}

function isRC(version: string) {
  return version.toLowerCase().includes('rc')
}

function isMinorAlreadyAdded(output: Array<string>, version: string) {
  if (
    output.some(el => {
      const elSegments = el.split('.')
      const versionSegments = version.split('.')
      return (
        elSegments[0] === versionSegments[0] &&
				elSegments[1] === versionSegments[1]
      )
    })
  ) {
    return true
  }
}

function semverCompare(a:string, b:string) {
  const regex = /^(\d+)\.(\d+)\.(\d+)(-rc\.\d+)?$/

  const aMatches = a.toLowerCase().match(regex) || []
  const [, majorA, minorA, patchA, rcA] = aMatches

  const bMatches = b.toLowerCase().match(regex) || []
  const [, majorB, minorB, patchB, rcB] = bMatches

  if (majorA !== majorB) return Number(majorB) - Number(majorA)
  if (minorA !== minorB) return Number(minorB) - Number(minorA)
  if (patchA !== patchB) return Number(patchB) - Number(patchA)

  if (!rcA) return -1
  if (!rcB) return 1

  return (
    Number.parseInt(rcB.replace('-rc.', ''), 10) -
		Number.parseInt(rcA.replace('-rc.', ''), 10)
  )
}
