'use strict'

const walkDeps = require('./walk-deps')
const list = require('./list')

function bowerFiles(options) {
  const deps = walkDeps(options)

  const listConfig = Object.assign({
    ext: [],
    match: [],
    join: {},
    camelCase: true,
    cwd: deps._cwd,
    main: true,
    self: true,
    dev: false
  }, options && options.defaults)

  return list(deps, listConfig)
}

module.exports = bowerFiles
