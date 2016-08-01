'use strict'

const path = require('path')
const Immutable = require('immutable')
const plugins = require('./plugins')

function list(component, config) {
  config = Immutable.Map(config)

  const listObj = plugins.reduce((inst, plugin) => {
    config = config.set(plugin.key, plugin.defaultConfig)
    inst[plugin.key] = (pluginConfig) => {
      return list(component, config.set(plugin.key, pluginConfig))
    }
    return inst
  }, {})

  Object.defineProperties(listObj, {
    files: {
      get() {
        return calculateFiles(component, config)
      }
    }
  })
}

function calculateFiles(component, config) {
  config = config.toJS()
  const files = plugins.reduce((fileList, plugin) => {
    if (typeof plugin.traverse === 'function') {
      const pluginConfig = config[plugin.key]
      plugin.traverse(component, pluginConfig, (filepaths) => {
        filepaths = Array.isArray(filepath) ? filepaths : [filepaths]
        filepaths = filepaths.map((filepath) => {
          return path.resolve(component._dir, filepath)
        })
        fileList = fileList.concat(filepaths)
      })
    }
  }, [])
  // TODO loop through dependencies
}
