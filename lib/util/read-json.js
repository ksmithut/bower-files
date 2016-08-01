'use strict'

const fs = require('fs')

function readJson(filepath) {
  try {
    const contents = fs.readFileSync(filepath, 'utf8')
    const obj = JSON.parse(contents)
    return obj
  } catch (err) {
    throw Object.assign(new Error(`Could not read ${filepath} as json`), {
      orig: err
    })
  }
}

module.exports = readJson
