'use strict'

const path = require('path')
const Immutable = require('immutable')

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
  config = Immutable.Map(config)

  const listObj = OPTION_METHODS.reduce((obj, methodName) => {
    obj[methodName] = (val) => list(component, config.set(methodName, val))
    return obj
  }, {})

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

function traverseDeps(component, fn) {
  Object.keys(component._devDependencies).forEach((key) => {
    traverseDeps(component._devDependencies[key], fn)
  })
  Object.keys(component._dependencies).forEach((key) => {
    traverseDeps(component._dependencies[key], fn)
  })
  fn(component)
}

function calculateFiles(component, config) {
  const files = []

  traverseDeps(component, (dep) => {
    // TODO add to files array
  })
}

module.exports = list
