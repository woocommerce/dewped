import {Args, Command, Flags, ux} from '@oclif/core'
import {access, constants, readFile} from 'node:fs/promises'
import fetch from 'node-fetch'
import {noDependenciesProvided, wpVersionNotFound, wcDEWPNotFound} from '../exit-codes.js'

const localPackageJsonPath = './package.json'

const endpoints = {
  wordpress: (v:string) => `https://raw.githubusercontent.com/WordPress/wordpress-develop/${v}/package.json`,
  woocommerce: (v:string, dep:string) => `https://raw.githubusercontent.com/woocommerce/woocommerce/${v}/packages/js/${dep}/package.json`,
  wcDEWP: (v:string) => `https://raw.githubusercontent.com/woocommerce/woocommerce/${v}/packages/js/dependency-extraction-webpack-plugin/assets/packages.js`,
}

export default class PlatfromDependencyVersion extends Command {
  static description = `Check the versions of given packages delivered by a specific version of the platform.

  Warning!
   For WooCommerce, it uses packages map delivered for the development (\`trunk\`) version of the DEWP. You can change that by providing the \`wcDEWP\` flag.
   But it takes WC monorepo revision, NOT the DEWP version.
   Also this tool assumes that:
   - All externalized WC packages are prefixed with \`@woocommerce/\`. That so far is true, but may change in the future.
   - All WC packages are in the \`packages/js\` directory. That is not true for all packages, like \`/settings\` - see https://github.com/woocommerce/woocommerce/issues/35603
   - \`dependency-extraction-webpack-plugin/assets/packages.js\` sticks to the simple structure, as we manually parse CJS export to JSON.


  `
  static aliases = ['pdep']

  static examples = [
    `<%= config.bin %> <%= command.id %> --wpVersion=6.0.3 @wordpress/components
     Name                  WordPress 6.0.3 WooCommerce  Local
     ───────────────────── ─────────────── ──────────── ─────
     @wordpress/components 19.8.5                             `,
    `<%= config.bin %> pdep -w=6.0.3 -c=7.0.1 @wordpress/components -d=.externalized.json

     Name                    WordPress 6.0.3 WooCommerce 7.0.1 Local
     ─────────────────────── ─────────────── ───────────────── ───────
     @woocommerce/components                 10.3.0            ^10.3.0
     @woocommerce/settings                   unknown
     @wordpress/data         6.6.1                             ^6.15.0
     react                   17.0.2                                     `,
  ]

  public static enableJsonFlag = true

  static flags = {
    dependenciesJSON: Flags.string({char: 'd', description: 'Path to the JSON file with dependencies to be checked. If not provided, the list of dependencies is read from the command arguments.'}),
    // TODO: make it "latest" by default. Accept "latest" as a value.
    // TODO: add support for minor "families" - `x.y` input.
    wpVersion: Flags.string({char: 'w', description: 'WordPress version to check against', required: true}),
    wcVersion: Flags.string({char: 'c', description: 'WooCommerce version to check against'}),
    wcDEWP: Flags.string({description: 'The revision of WooCommerce monorepo to check DEWP version to be considered. It implies the set of packages to be checked in WooCommerce repo.', default: 'trunk'}),
    ...ux.table.flags(),
  }

  // Read variable length of arguments.
  static strict = false

  static args = {
    'dependencies...': Args.string({description: 'packages to be checked'}),
  }

  public async run(): Promise<any> {
    const {flags} = await this.parse(PlatfromDependencyVersion)

    // Get the list of dependencies to be checked.
    const requestedDependencies = flags.dependenciesJSON ?
      JSON.parse(await readFile(flags.dependenciesJSON, {encoding: 'utf8'})) as Array<string> :
      this.argv.filter(arg => !arg.startsWith('-'))

    if (requestedDependencies.length === 0) {
      return this.error('No dependencies provided.', {exit: noDependenciesProvided})
    }

    // Fetch the list of *all* WP packages for a given version.
    let wpDependencies: any
    try {
      const response = await fetch(endpoints.wordpress(flags.wpVersion))
      const wpPackageJson = await response.json() as any
      wpDependencies = wpPackageJson.dependencies
    } catch {
      return this.error(`Packages list for WordPress version ${flags.wpVersion} not found.`, {exit: wpVersionNotFound})
    }

    let requestedWcDependencies
    const wcDependencies = new Map()
    if (flags.wcVersion) {
      // Fetch the list of DEWPed WC packages.
      let wcDEWPED: Array<string>
      try {
        const response = await fetch(endpoints.wcDEWP(flags.wcDEWP))
        const wcDEWPpackagesJs = await response.text() as string

        // Naively parse CJS export to JSON.
        wcDEWPED = JSON.parse(
          // Strip out comments.
          wcDEWPpackagesJs.replace(/\s*\/\/.*\n/g, '')
          // Extract the exported array.
          .match(/\.exports\s*=\s*(\[.*])/s)![1]
          // Replace single quotes with double quotes.
          .replace(/'/g, '"')
          // Replace trailing comma with an empty string.
          .replace(/,\s*]/, ']'),
        )
      } catch {
        return this.error(`Failed to load & parse the list of packages externalized by WooCommerce DEWP ${flags.wcDEWP}.`, {exit: wcDEWPNotFound})
      }

      // Considered only those packages that are externalized by default by wc/DEWP => we assume it means they are actually shipped with WC.
      // Technically, there may be some other (locally externalized) `@woocommerce/*` packages, which may be shipped by other providers.
      requestedWcDependencies = wcDEWPED.filter((dep: string) => requestedDependencies.includes(dep))

      for await (const dep of requestedWcDependencies) {
        // We assume all packages are in the `packages/js` directory and prefixed with @woocommerce/.
        const packagePath = endpoints.woocommerce(flags.wcVersion, dep.replace('@woocommerce/', ''))
        try {
          const response = await (await fetch(packagePath)).json() as any
          wcDependencies.set(dep, response.version)
        } catch {
          this.warn(`${dep} version not found in WooCommerce ${flags.wcVersion} at ${packagePath}.`)
          wcDependencies.set(dep, 'unknown')
        }
      }
    }

    // Read local package.json if available.
    const hasLocalPackageJson = await access(localPackageJsonPath, constants.R_OK).then(() => true).catch(() => false)
    let localDependencies:any
    if (hasLocalPackageJson) {
      const contents = await readFile(localPackageJsonPath, {encoding: 'utf8'})
      localDependencies = JSON.parse(contents).dependencies
    }

    const allData = requestedDependencies.map(dep => {
      return {
        name: dep,
        wpVersion: wpDependencies[dep] || null,
        wcVersion: wcDependencies.get(dep) || null,
        localVersion: localDependencies[dep] || null,
      }
    })

    ux.table(allData, {
      name: {},
      wpVersion: {
        header: 'WordPress ' + flags.wpVersion,
      },
      wcVersion: {
        header: 'WooCommerce ' + (flags.wcVersion || ''),
      },
      localVersion: {
        header: 'Local',
      },
    }, {
      printLine: this.log.bind(this),
      ...flags, // parsed flags
    })

    return allData
  }
}
