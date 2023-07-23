/**
 * Command to get latest versions of a given plugin or platform.
 *
 * The code was cloned from
 * https://github.com/woocommerce/grow/blob/e4e0d31c0844f038d1657ca74e2bc47725bc294a/packages/js/github-actions/actions/get-plugin-releases/src/get-plugin-releases.js
 */
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
    `$ <%= config.bin %> <%= command.id %>
Fetching L-2 versions wordpress!
["6.2.2","6.1.3","6.0.5"]
`,
    `$ <%= config.bin %> l-x woocommerce 4
Fetching L-4 versions woocommerce!
["7.8.1","7.7.2","7.6.1","7.5.1","7.4.1"]
`,
  ]

  public static enableJsonFlag = true

  static flags = {
    includeRC: Flags.boolean({char: 'r', aliases: ['rc'], description: `Whether to include Release Candidates in the fetched versions. (WordPress is NOT compatible with this).
    By default, it returns the RCs only if UNRELEASED versions. To get all RCs for released versions, add \`--includePatches\` flag.
    Please note that the behavior of this flag may change in the future.`}),
    includePatches: Flags.boolean({char: 'p', aliases: ['patches'], description: 'Whether to include Patches in the fetched versions. (WordPress is NOT compatible with this)'}),
  }

  static args = {
    slug: Args.string({description: 'Slug of the plugin. It should be registered on WordPress.org.', default: 'wordpress'}),
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
            release => (includeRC || !isRC(release)),
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
