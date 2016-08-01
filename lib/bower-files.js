'use strict'

const walkDeps = require('./walk-deps')
const list = require('./list')

function bowerFiles(options) {
  const deps = walkDeps(options)

  return list(deps, {})
}

module.exports = bowerFiles
