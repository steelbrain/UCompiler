"use strict"
let NodeStream = require('stream')
let FS = require('fs')
let Helpers = require('./Helpers')
let Path = require('path')
class UCompiler{
  static compileFile(FilePath, Options){
    Options = Helpers.normalizeOptions(Options)
    Options.File = {Path: FilePath, Extension: Path.extname(FilePath)}
    return UCompiler.compileStream(FS.createReadStream(FilePath), Options)
  }
  static compileString(Content, Options){
    Options = Helpers.normalizeOptions(Options)
    let Stream = new NodeStream.Readable()
    Stream._read = function(){ }
    Stream.push(Content)
    Stream.push(null)
    return UCompiler.compileStream(Stream, Options)
  }
  static compileStream(Stream, Options){
    Options = Helpers.normalizeOptions(Options)
    return new Promise(function(Resolve){
      let Valid = []
      for(let Plugin of UCompiler.Plugins){
        if(Plugin.Validate(Options)){
          Valid.push(Plugin)
        }
      }
      Resolve(Promise.all(Valid.sort(function(a, b){
          return a.Info.Priority - b.Info.Priority
        }).map(function(Plugin){
          return Plugin.Stream(Options)
        })))
    }).then(function(Streams){
        for(let _Stream of Streams){
          Stream = Stream.pipe(_Stream)
        }
        return Stream
      })
  }
}

UCompiler.Plugins = new Set()

// Loading Plugins
require('../Plugins/Javascript').Register(UCompiler)

UCompiler.compileFile('/var/web/PublishSpace/dQuery/Source/Main.js').then(function(Stream){
   Stream.pipe(process.stdout)
}).catch(function(err){
  console.error(err)
})

module.exports = UCompiler