'use strict'

exports.key = 'main'
exports.defaultConfig = true

exports.config = Boolean

exports.traverse = (component, config, pushFiles) => {
  if (config) pushFiles(component.main)
  return true
}
