'use strict'

const path = require('path')
const BowerConfig = require('bower-config')
const readJson = require('./util/read-json')
const TYPES = require('./util/types')

function walkDeps(options) {
  options = Object.assign({
    cwd: process.cwd(),
    json: 'bower.json',
    componentJson: '.bower.json'
  }, options)

  const config = new BowerConfig(options.cwd)
    .load()
    .toObject()
  const directory = path.join(config.cwd, config.directory)
  const rootPath = path.join(config.cwd, options.json)
  const root = resolveComponent(
    rootPath,
    directory,
    options.componentJson,
    TYPES.ROOT
  )

  root._cwd = options.cwd

  return root
}

function resolveComponent(componentPath, dir, filename, type) {
  const comp = readJson(componentPath)
  comp._type = type
  comp._path = componentPath
  comp._dir = path.dirname(componentPath)
  comp._dependencies = resolveDeps(
    comp.dependencies,
    dir,
    filename,
    TYPES.MAIN
  )
  if (type === TYPES.ROOT) {
    comp._devDependencies = resolveDeps(
      comp.devDependencies,
      dir,
      filename,
      TYPES.DEV
    )
  } else {
    comp._devDependencies = {}
  }
  return comp
}

function resolveDeps(dependencies, dir, filename, type) {
  return Object.keys(dependencies || {}).reduce((deps, depName) => {
    const componentPath = path.join(dir, depName, filename)
    deps[depName] = resolveComponent(componentPath, dir, filename, type)
    return deps
  }, {})
}

module.exports = walkDeps
