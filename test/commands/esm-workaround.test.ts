// Oclif/test uses `module.parent` which is not available in ESM.
// We need to work around this by using `createRequire` to force CJS loading.
// See https://github.com/oclif/test/issues/301#issuecomment-1501896045
import {createRequire} from 'node:module'
import {expect as expectType, test as testType} from '@oclif/test'
export const {expect, test} = createRequire(import.meta.url)('@oclif/test') as {
  expect: typeof expectType;
  test: typeof testType;
}
