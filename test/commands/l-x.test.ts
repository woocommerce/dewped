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
  })
})
