dewped
=================

CLI tool to support devs using WP- & WC/dependency-extraction-webpack-plugin.

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g dewped
$ dewped COMMAND
running command...
$ dewped (--version)
dewped/0.0.0 linux-x64 node-v16.19.0
$ dewped --help [COMMAND]
USAGE
  $ dewped COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dewped help [COMMANDS]`](#dewped-help-commands)
* [`dewped latest-versions [SLUG] [OFFSET]`](#dewped-latest-versions-slug-offset)
* [`dewped platform-dependency-version [DEPENDENCIES...]`](#dewped-platform-dependency-version-dependencies)

## `dewped help [COMMANDS]`

Display help for dewped.

```
USAGE
  $ dewped help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for dewped.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.11/src/commands/help.ts)_

## `dewped latest-versions [SLUG] [OFFSET]`

Get the range of x+1 latest versions of a package

```
USAGE
  $ dewped latest-versions [SLUG] [OFFSET] [--json] [-r] [-p]

ARGUMENTS
  SLUG    [default: wordpress] Slug of the plugin. It should be registered on WordPress.org.
  OFFSET  [default: 2] How far from the latest we should offset

FLAGS
  -p, --includePatches  Whether to include Patches in the fetched versions. (WordPress is NOT compatible with this)
  -r, --includeRC       Whether to include Release Candidates in the fetched versions. (WordPress is Not compatible with
                        this)

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Get the range of x+1 latest versions of a package

ALIASES
  $ dewped lx
  $ dewped latest-x
  $ dewped latestversions
  $ dewped latest-versions

EXAMPLES
  $ dewped latest-versions
  Fetching L-2 versions wordpress!
  ["6.2.2","6.1.3","6.0.5"]

  $ dewped l-x woocommerce 4
  Fetching L-4 versions woocommerce!
  ["7.8.1","7.7.2","7.6.1","7.5.1","7.4.1"]
```

## `dewped platform-dependency-version [DEPENDENCIES...]`

Check the versions of given packages delivered by a specific version of the platform.

```
USAGE
  $ dewped platform-dependency-version [DEPENDENCIES...] -w <value> [--json] [-d <value>] [-c <value>] [--wcDEWP <value>]
    [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]]
    [--no-header | ]

ARGUMENTS
  DEPENDENCIES...  packages to be checked

FLAGS
  -c, --wcVersion=<value>         WooCommerce version to check against
  -d, --dependenciesJSON=<value>  Path to the JSON file with dependencies to be checked. If not provided, the list of
                                  dependencies is read from the command arguments.
  -w, --wpVersion=<value>         (required) WordPress version to check against
  -x, --extended                  show extra columns
  --columns=<value>               only show provided columns (comma-separated)
  --csv                           output is csv format [alias: --output=csv]
  --filter=<value>                filter property by partial string matching, ex: name=foo
  --no-header                     hide table header from output
  --no-truncate                   do not truncate output to fit screen
  --output=<option>               output in a more machine friendly format
                                  <options: csv|json|yaml>
  --sort=<value>                  property to sort by (prepend '-' for descending)
  --wcDEWP=<value>                [default: trunk] The revision of WooCommerce monorepo to check DEWP version to be
                                  considered. It implies the set of packages to be checked in WooCommerce repo.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Check the versions of given packages delivered by a specific version of the platform.

  Warning!
  For WooCommerce, it uses packages map delivered for the development (`trunk`) version of the DEWP. You can change that
  by providing the `wcDEWP` flag.
  But it takes WC monorepo revision, NOT the DEWP version.
  Also this tool assumes that:
  - All externalized WC packages are prefixed with `@woocommerce/`. That so far is true, but may change in the future.
  - All WC packages are in the `packages/js` directory. That is not true for all packages, like `/settings` - see
  https://github.com/woocommerce/woocommerce/issues/35603
  - `dependency-extraction-webpack-plugin/assets/packages.js` sticks to the simple structure, as we manually parse CJS
  export to JSON.




ALIASES
  $ dewped pdep

EXAMPLES
  $ dewped platform-dependency-version --wpVersion=6.0.3 @wordpress/components
       Name                  WordPress 6.0.3
       ───────────────────── ───────────────
       @wordpress/components 19.8.5                             

  $ dewped pdep -w=6.0.3 -c=7.0.1 @wordpress/components -d=.externalized.json
       Name                    WordPress 6.0.3 WooCommerce 7.0.1 Local
       ─────────────────────── ─────────────── ───────────────── ───────
       @woocommerce/components                 10.3.0            ^10.3.0
       @woocommerce/settings                   unknown
       @wordpress/data         6.6.1                             ^6.15.0
       react                   17.0.2
```

_See code: [dist/commands/platform-dependency-version.ts](https://github.com/tomalec/dewped/blob/v0.0.0/dist/commands/platform-dependency-version.ts)_
<!-- commandsstop -->
