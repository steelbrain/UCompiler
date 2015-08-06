'use strict'

const Base = require('./base')
let LessJS

class PluginCoffee extends Base {
  constructor() {
    super()
  }
  compile(contents, options) {
    LessJS = LessJS || require('less')
    return new Promise(function(resolve, reject) {
      LessJS.render(contents, {
        filename: options.internal.file.name,
        sourceMap: options.SourceMap,
        paths: [options.internal.file.directory],
        compress: options.Compress,
      }, function(error, output) {
        if (error) reject(error)
        else resolve(output.css)
      })
    })
  }
}

module.exports = PluginCoffee