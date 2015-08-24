#!/usr/bin/env node
"use strict"
let FSWatcher = require('../lib/watcher')
let Minimist = require('minimist')
let Options = Minimist(process.argv.slice(2))
let FS = require('fs')
try {
  Options.Blacklist = String(Options.Blacklist || '').split(',').map(function(e) { return e.trim() }).filter(function(e) { return e && e !== 'true' })
  if(!Options['_'].length) throw new Error("Please specify a file/directory to watch")
  let Watcher = new FSWatcher(Options['_'][0], Options.Ignored)
  Watcher.on('error', function(e){
    console.error(e)
  })
} catch(err){
  console.error(err)
}
