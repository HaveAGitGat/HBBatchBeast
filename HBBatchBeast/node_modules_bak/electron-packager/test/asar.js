'use strict'

const common = require('../common')
const path = require('path')
const test = require('ava')
const util = require('./_util')

test('asar argument test: asar is not set', t => {
  const asarOpts = common.createAsarOpts({})
  t.false(asarOpts, 'createAsarOpts returns false')
})

test('asar argument test: asar is true', t => {
  t.deepEqual(common.createAsarOpts({asar: true}), {})
})

test('asar argument test: asar is not an Object or a bool', t => {
  t.false(common.createAsarOpts({asar: 'string'}), 'createAsarOpts returns false')
})

util.testSinglePlatform('default_app.asar removal test', (t, opts) => {
  opts.name = 'default_appASARTest'
  opts.dir = util.fixtureSubdir('el-0374')
  opts.electronVersion = '0.37.4'

  return util.packageAndEnsureResourcesPath(t, opts)
    .then(resourcesPath => util.assertPathNotExists(t, path.join(resourcesPath, 'default_app.asar'), 'The output directory should not contain the Electron default_app.asar file'))
})

function assertUnpackedAsar (t, resourcesPath) {
  return util.assertDirectory(t, path.join(resourcesPath, 'app.asar.unpacked'), 'app.asar.unpacked should exist under the resources subdirectory when opts.asar_unpack is set')
    .then(() => util.assertDirectory(t, path.join(resourcesPath, 'app.asar.unpacked', 'dir_to_unpack'), 'dir_to_unpack should exist under app.asar.unpacked subdirectory when opts.asar-unpack-dir is set dir_to_unpack'))
}

util.testSinglePlatform('asar test', (t, opts) => {
  opts.name = 'asarTest'
  opts.dir = util.fixtureSubdir('basic')
  opts.asar = {
    'unpack': '*.pac',
    'unpackDir': 'dir_to_unpack'
  }

  return util.packageAndEnsureResourcesPath(t, opts)
    .then(resourcesPath => {
      return Promise.all([
        util.assertFile(t, path.join(resourcesPath, 'app.asar'), 'app.asar should exist under the resources subdirectory when opts.asar is true'),
        util.assertPathNotExists(t, path.join(resourcesPath, 'app'), 'app subdirectory should NOT exist when app.asar is built'),
        assertUnpackedAsar(t, resourcesPath)
      ])
    })
})
