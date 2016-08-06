'use strict'

const path = require('path')
const Immutable = require('immutable')
const globby = require('globby')
const TYPES = require('./util/types')

const OPTION_METHODS = [
  'self',
  'relative',
  'main',
  'dev',
  'ext',
  'match',
  'join'
]

function list(component, config) {
  config = Immutable.fromJS(config)

  const listObj = {
    self(val) {
      if (typeof val === 'undefined') val = true
      const newConfig = config.set('self', val)
      return list(component, newConfig)
    },
    relative(val) {
      if (typeof val === 'undefined') val = component._cwd
      const newConfig = config.set('relative', val)
      return list(component, newConfig)
    },
    main(val) {
      if (typeof val === 'undefined') val = true
      const newConfig = config.set('main', val)
      return list(component, newConfig)
    },
    dev(val) {
      if (typeof val === 'undefined') val = true
      const newConfig = config.set('dev', val)
      return list(component, newConfig)
    },
    ext(val) {
      let newExt = config.get('ext')
      if (typeof val === 'boolean') {
        newExt = val
      } else {
        if (!Immutable.isList(newExt)) newExt = Immutable.List.of()
        newExt = newExt.concat(val)
      }
      const newConfig = config.set('ext', newExt)
      return list(component, newConfig)
    },
    match(val) {
      const newMatch = config.get('match').concat(val)
      const newConfig = config.set('match', newMatch)
      return list(component, newConfig)
    },
    join(joinDef) {
      const newJoin = config.get('join').merge(joinDef)
      const newConfig = config.set('join', newJoin)
      return list(component, newConfig)
    }
  }

  listObj.filter = (filterConfig) => {
    filterConfig = filterConfig || {}
    return OPTION_METHODS.reduce((newList, method) => {
      if (!filterConfig.hasOwnProperty(method)) return newList
      return newList[method](filterConfig(method))
    }, list(component, config)).files
  }

  Object.defineProperties(listObj, {
    files: {
      enummerable: true,
      get() {
        return calculateFiles(component, config)
      }
    },
    deps: {
      enummerable: true,
      get() {

      }
    },
    depsArray: {
      enummerable: true,
      get() {

      }
    }
  })

  return listObj
}

function traverseDeps(component, options) {
  let shouldRun = options.pre(component)
  if (!shouldRun) return
  const allComponents = {
    devDeps: values(component._devDependencies),
    mainDeps: values(component._dependencies)
  }
  options.order.forEach((key) => {
    allComponents[key].forEach((dep) => traverseDeps(dep, options))
  })
  options.run(component)
}

function calculateFiles(rootComponent, config) {
  let files = []
  let order = [ 'devDeps', 'mainDeps' ]

  if (config.get('dev') === 'after') {
    order = [ 'mainDeps', 'devDeps' ]
  }

  traverseDeps(rootComponent, {
    order,
    pre(component) {
      switch (component._type) {
      case TYPES.MAIN:
        return config.get('main')
      case TYPES.DEV:
        return config.get('dev')
      case TYPES.ROOT:
        return true
      default:
        return false // TODO log error
      }
    },
    run(component) {
      let componentFiles = []
      if (component._type !== TYPES.ROOT || config.get('self')) {
        componentFiles = componentFiles.concat(component.main)
      }
      const resolvedFiles = globby
        .sync(componentFiles, {
          cwd: component._dir
        })
        .map((filepath) => path.join(component._dir, filepath))
      files = files.concat(resolvedFiles)
    }
  })

  files = files
    .filter((val, i, arr) => arr.indexOf(val) === i)

  return files
}

function values(obj) {
  return Object.keys(obj).map((key) => obj[key])
}

module.exports = list
