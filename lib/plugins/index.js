'use strict'

const dev = require('./dev')
const ext = require('./ext')
const join = require('./join')
const main = require('./main')
const match = require('./match')
const relative = require('./relative')
const self = require('./self')

module.exports = [
  dev,
  ext,
  join,
  main,
  match,
  relative,
  self
]
