import {expect, test} from '@oclif/test'

describe('l-x', () => {
  // No arguments.
  test
  .stdout()
  .command(['l-x'])
  .it('by default logs that it\'s "Fetching L-2 versions from wordpress"', ctx => {
    expect(ctx.stdout).to.contain('Fetching L-2 versions wordpress!')
  })
  test
  .stdout()
  .command(['l-x'])
  .it('by default logs three versions in JSON format as a last lint in stdoutput', ctx => {
    // Expect `["d.d.d","d.d.d","d.d.d"]` where `d` is an integer.
    // Below is tslint optimized version of `/\["\d+\.\d+\.\d+","\d+\.\d+\.\d+","\d+\.\d+\.\d+"\]/`.
    expect(ctx.stdout.trim().split('\n').pop()).to.match(/\[(?:"(?:\d+\.){2}\d+",){2}"(?:\d+\.){2}\d+"]/)
  })

  // Specific slug.
  test
  .stdout()
  .command(['l-x', 'google-listings-and-ads'])
  .it('when slug (first) argument is provided logs that it\'s "Fetching L-2 versions from {slug}"', ctx => {
    expect(ctx.stdout).to.contain('Fetching L-2 versions google-listings-and-ads!')
  })
  // Specific slug and version offset.
  test
  .stdout()
  .command(['l-x', 'google-listings-and-ads', '1'])
  .it('when slug (first) argument is provided & offset (second) logs that it\'s "Fetching L-{offset-1} versions from {slug}"', ctx => {
    expect(ctx.stdout).to.contain('Fetching L-1 versions google-listings-and-ads!')
    expect(ctx.stdout.trim().split('\n').pop()).to.match(/\["\d+\.\d+\.\d+","\d+\.\d+\.\d+"]/)
  })

  describe('with `--json` param', () => {
    test
    .stdout()
    .command(['l-x', '--json'])
    .it('by default returns 3 main versions', ctx => {
      const result = ctx.returned as string[]
      expect(result).to.have.lengthOf(3)
      for (const version of result) {
        expect(version).to.match(/\d+\.\d+\.\d+/)
      }
    })

    test
    .stdout()
    .command(['l-x', 'wordpress', '4', '--json'])
    .it('when offset (second) argument is provided returns given number +1 versions', ctx => {
      const result = ctx.returned as string[]
      expect(result).to.have.lengthOf(5)
      for (const version of result) {
        expect(version).to.match(/\d+\.\d+\.\d+/)
      }
    })
    describe('with `--includePatches` param', () => {
      test
      .stdout()
      .command(['l-x', 'woocommerce', '10', '--includePatches', '--json'])
      .it('returns `{offset}+1` versions', ctx => {
        const result = ctx.returned as string[]
        expect(result).to.have.lengthOf(11)
        for (const version of result) {
          expect(version).to.match(/\d+\.\d+\.\d+/)
        }
      })
      // Actually there is no quarantee, that the current L-x version will include any patches.
      // But with a high offset, we increase the likelyhood of that.
      // Alternatively we could mock the WPORG API responses.
      test
      .stdout()
      .command(['l-x', 'woocommerce', '10', '--includePatches', '--json'])
      .it('returns different patch versions of the same `x.y` family', ctx => {
        const result = ctx.returned as string[]
        const families = new Map<string, number>()
        for (const version of result) {
          // Count patches per family.
          const family = version.split('.').slice(0, 2).join('.')
          families.set(family, (families.get(family) || 0) + 1)
        }

        // Expect at least one family to have more than one patch.
        expect(Math.max(...families.values())).to.be.greaterThan(1)
      })
    })
    // It's hard to check just `--includeRC` param, because there may be no latest RC version.
    // So we test only the presence of RC versions for the released ones.
    describe('with `--includeRC` & `--includePatches` params (This is a currently expected behavior but may be changed in the future once we implement a use-case)', () => {
      test
      .stdout()
      .command(['l-x', 'woocommerce', '10', '--includeRC', '--includePatches', '--json'])
      .it('returns `{offset}+1` versions', ctx => {
        const result = ctx.returned as string[]
        expect(result).to.have.lengthOf(11)
        for (const version of result) {
          expect(version).to.match(/\d+\.\d+\.\d+/)
        }
      })

      // Actually there is no quarantee, that the current L-x version will include any RC.
      // For example, if there wre x+1 patches, there will be no RC.
      // But with a high offset, we increase the likelyhood of that.
      // Alternatively we could mock the WPORG API responses.
      test
      .stdout()
      .command(['l-x', 'woocommerce', '10', '--includeRC', '--includePatches', '--json'])
      .it('should include all past RC versions', ctx => {
        const result = ctx.returned as string[]
        const versionsWithRC = new Set<string>()
        for (const version of result) {
          // Count patches per family.
          const patchVersion = version.split('.').slice(0, 3).join('.')
          versionsWithRC.add(patchVersion)
        }

        // Expect at least two versions to have an RC.
        expect(versionsWithRC.size).to.be.greaterThanOrEqual(2)
      })
    })
  })
})
