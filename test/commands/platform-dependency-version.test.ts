import {expect, test} from '@oclif/test'
import {readFile} from 'node:fs/promises'

describe('platform-dependency-version', () => {
  describe('checks dependencies versions for a given WP version', () => {
    test
    .stdout()
    .command(['platform-dependency-version', '--wpVersion=6.0.3', 'react', '@wordpress/data', 'foo'])
    .it('renders it in a table', ctx => {
      // Header contains the package name.
      expect(ctx.stdout).to.have.string('Name')
      // Header contains the WP version.
      expect(ctx.stdout).to.have.string('WordPress 6.0.3')
      // Header doesn't contain the WC.
      expect(ctx.stdout).not.to.have.string('WooCommerce')

      // Prints packages with their versions.
      expect(ctx.stdout).to.match(/@wordpress\/data\s*6\.6\.1/ms)
      expect(ctx.stdout).to.match(/react\s*17\.0\.2/ms)
      expect(ctx.stdout).to.match(/foo\s*$/ms) // No version for unmatched package
    })

    test
    .stdout()
    .command(['platform-dependency-version', '--wpVersion=6.0.3', '@wordpress/components', 'baz', '--dependenciesJSON=test/mocks/.externalized.json'])
    .it('with --dependenciesJSON takes dependencies in from JSON file, ignoring the ones from arguments', ctx => {
      // Header contains the package name.
      expect(ctx.stdout).to.have.string('Name')
      // Header contains the WP version.
      expect(ctx.stdout).to.have.string('WordPress 6.0.3')
      // Header doesn't contain the WC.
      expect(ctx.stdout).not.to.have.string('WooCommerce')

      // Prints packages with their versions.
      expect(ctx.stdout).to.match(/@wordpress\/data\s*6\.6\.1/ms)
      expect(ctx.stdout).to.match(/react\s*17\.0\.2/ms)
      expect(ctx.stdout).to.match(/foo\s*$/ms) // No version for unmatched package

      // Does not print packages from arguments.
      expect(ctx.stdout).to.not.match(/@wordpress\/components/ms)
      expect(ctx.stdout).to.not.match(/baz/)
    })

    test
    .stdout()
    .command(['platform-dependency-version', '--wpVersion=6.0.3', '--dependenciesJSON=test/mocks/.externalized.json', '--json'])
    .it('with `--json` returns them in JSON format', ctx => {
      const result = ctx.returned as string[]
      expect(result).to.deep.equal(
        [
          {name: 'react', wpVersion: '17.0.2', localVersion: null},
          {name: '@wordpress/data', wpVersion: '6.6.1', localVersion: null},
          {name: 'foo', wpVersion: null, localVersion: null},
          {name: '@woocommerce/components', wpVersion: null, localVersion: null},
          {name: '@woocommerce/settings', wpVersion: null, localVersion: null},
        ],
      )
    })
  })

  describe('if there is a package.json in working directory, it checks the dependency versions there', () => {
    // Check the actual oclif version.
    let localOclifVersion : string
    before(async () => {
      localOclifVersion = JSON.parse(await readFile('package.json', 'utf-8')).dependencies['@oclif/core']
    })

    test
    .stdout()
    .command(['platform-dependency-version', '--wpVersion=6.0.3', '@oclif/core'])
    .it('render it in the table', ctx => {
      // Calculate the table indention.
      const emptyWPWCColumns = ' WordPress 6.0.3 '.replace(/\S/g, ' ')
      // Header contains the "Local".
      expect(ctx.stdout).to.have.string('Local')

      // Expect the output to contain the local oclif version.
      expect(ctx.stdout).to.have.string(`@oclif/core${emptyWPWCColumns}${localOclifVersion}`)
    })

    test
    .stdout()
    .command(['platform-dependency-version', '--wpVersion=6.0.3', '@oclif/core', '--json'])
    .it('include it in the JSON output', async ctx => {
      // Expect the output to contain the local oclif version.
      const result = ctx.returned as string[]
      expect(result).to.deep.equal(
        [
          {name: '@oclif/core', wpVersion: null, localVersion: localOclifVersion},
        ],
      )
    })
    // We need to mock/change the cwd, so we can test the case when there is no package.json file.
  })

  // Test WC versions
  describe('with `--wcVersion` param', () => {
    describe('checks dependencies versions for a given WC version', () => {
      test
      .stdout()
      .command(['platform-dependency-version', '--wcVersion=7.0.1', '--dependenciesJSON=test/mocks/.externalized.json'])
      .it('renders it in a table', ctx => {
        // Header contains the WC version.
        expect(ctx.stdout).to.have.string('WooCommerce 7.0.1')

        // Should not include versions for WP and non-matching packages.
        expect(ctx.stdout).to.match(/@wordpress\/data\s*$/ms)
        expect(ctx.stdout).to.match(/react\s*$/ms)
        expect(ctx.stdout).to.match(/foo\s*$/ms)
        // Prints WC versions
        expect(ctx.stdout).to.match(/@woocommerce\/components\s*10\.3\.0/)
        expect(ctx.stdout).to.match(/@woocommerce\/settings\s*unknown/) // Not found WC package.
      })
    })
    describe('& `--wpVersion` checks dependencies versions for a given WP & WC versions', () => {
      test
      .stdout()
      .command(['platform-dependency-version', '--wpVersion=6.0.3', '--wcVersion=7.0.1', '--dependenciesJSON=test/mocks/.externalized.json'])
      .it('renders it in a table', ctx => {
        // Header contains the WC version.
        expect(ctx.stdout).to.have.string('WooCommerce 7.0.1')

        // Prints packages with their versions.
        expect(ctx.stdout).to.match(/@wordpress\/data\s*6\.6\.1/ms)
        expect(ctx.stdout).to.match(/react\s*17\.0\.2/ms)
        expect(ctx.stdout).to.match(/foo\s*$/ms) // No version for unmatched package
        // Prints WC versions
        expect(ctx.stdout).to.match(/@woocommerce\/components\s*10\.3\.0/)
        expect(ctx.stdout).to.match(/@woocommerce\/settings\s*unknown/) // Not found WC package.
      })

      test
      .stderr()
      .command(['platform-dependency-version', '--wpVersion=6.0.3', '--wcVersion=7.0.1', '--dependenciesJSON=test/mocks/.externalized.json'])
      .it('warns about not found `@woocommerce/*` packages', ctx => {
        expect(ctx.stderr).to.have.string('Warning: @woocommerce/settings version not found')
        expect(ctx.stderr).to.have.string('WooCommerce 7.0.1')
      })

      test
      .stdout()
      .command(['platform-dependency-version', '--wpVersion=6.0.3', '--wcVersion=7.0.1', '--json', '--dependenciesJSON=test/mocks/.externalized.json'])
      .it('with `--json`, returns it in JSON format', ctx => {
        const result = ctx.returned as string[]
        expect(result).to.deep.equal(
          [
            {name: 'react', wpVersion: '17.0.2', wcVersion: null, localVersion: null},
            {name: '@wordpress/data', wpVersion: '6.6.1', wcVersion: null, localVersion: null},
            {name: 'foo', wpVersion: null, wcVersion: null, localVersion: null},
            {name: '@woocommerce/components', wpVersion: null, wcVersion: '10.3.0', localVersion: null},
            {name: '@woocommerce/settings', wpVersion: null, wcVersion: 'unknown', localVersion: null},
          ],
        )
      })
    })

    describe('with `--wcDEWP` param, uses a specific list of packages externalized from WC', () => {
      test
      .stdout()
      .command(['platform-dependency-version', '--wpVersion=6.0.3', '--wcVersion=7.8.1', '@woocommerce/admin-layout', '--wcDEWP=7.8.1'])
      .it('which may add some packages', ctx => {
        // Prints the package with its version.
        expect(ctx.stdout).to.match(/@woocommerce\/admin-layout\s*1\.0\.0-beta\.0/ms)
      })

      test
      .stdout()
      .command(['platform-dependency-version', '--wpVersion=6.0.3', '--wcVersion=7.8.1', '@woocommerce/admin-layout', '--wcDEWP=7.0.1'])
      .it('which may miss some packages', ctx => {
        // Prints the package without any version.
        expect(ctx.stdout).to.match(/@woocommerce\/admin-layout\s*$/ms)
      })
    })
  })
})
