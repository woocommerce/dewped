oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

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
* [`dewped hello PERSON`](#dewped-hello-person)
* [`dewped hello world`](#dewped-hello-world)
* [`dewped help [COMMANDS]`](#dewped-help-commands)
* [`dewped plugins`](#dewped-plugins)
* [`dewped plugins:install PLUGIN...`](#dewped-pluginsinstall-plugin)
* [`dewped plugins:inspect PLUGIN...`](#dewped-pluginsinspect-plugin)
* [`dewped plugins:install PLUGIN...`](#dewped-pluginsinstall-plugin-1)
* [`dewped plugins:link PLUGIN`](#dewped-pluginslink-plugin)
* [`dewped plugins:uninstall PLUGIN...`](#dewped-pluginsuninstall-plugin)
* [`dewped plugins:uninstall PLUGIN...`](#dewped-pluginsuninstall-plugin-1)
* [`dewped plugins:uninstall PLUGIN...`](#dewped-pluginsuninstall-plugin-2)
* [`dewped plugins update`](#dewped-plugins-update)

## `dewped hello PERSON`

Say hello

```
USAGE
  $ dewped hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/tomalec/dewped/blob/v0.0.0/dist/commands/hello/index.ts)_

## `dewped hello world`

Say hello world

```
USAGE
  $ dewped hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ dewped hello world
  hello world! (./src/commands/hello/world.ts)
```

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.9/src/commands/help.ts)_

## `dewped plugins`

List installed plugins.

```
USAGE
  $ dewped plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ dewped plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/index.ts)_

## `dewped plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ dewped plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ dewped plugins add

EXAMPLES
  $ dewped plugins:install myplugin 

  $ dewped plugins:install https://github.com/someuser/someplugin

  $ dewped plugins:install someuser/someplugin
```

## `dewped plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ dewped plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ dewped plugins:inspect myplugin
```

## `dewped plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ dewped plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ dewped plugins add

EXAMPLES
  $ dewped plugins:install myplugin 

  $ dewped plugins:install https://github.com/someuser/someplugin

  $ dewped plugins:install someuser/someplugin
```

## `dewped plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ dewped plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ dewped plugins:link myplugin
```

## `dewped plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ dewped plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dewped plugins unlink
  $ dewped plugins remove
```

## `dewped plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ dewped plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dewped plugins unlink
  $ dewped plugins remove
```

## `dewped plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ dewped plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dewped plugins unlink
  $ dewped plugins remove
```

## `dewped plugins update`

Update installed plugins.

```
USAGE
  $ dewped plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
