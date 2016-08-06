'use strict'

const path = require('path')
const originalDir = process.cwd()

module.exports = (base) => {
  const fixturesDir = path.resolve(__dirname, '..', base)
  let current = originalDir
  function cd(dir) {
    current = path.resolve(fixturesDir, dir)
    process.chdir(current)
  }
  cd.reset = cd.bind(null, originalDir)
  return cd
}
