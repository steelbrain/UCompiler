'use babel'

import FS from 'fs'
import Path from 'path'
import {template} from '../defaults'
import {normalizePath} from './common'

const debug = require('debug')('UCompiler:Save')

export function saveFile(contents, config, {root, relativePath, absolutePath}, state) {
  const output = config.outputPath

  if (output === '-') {
    process.stdout.write(contents)
    return contents
  } else if (output === '--') {
    return contents
  } else {
    const parsed = Path.parse(absolutePath)
    const absoluteDir = normalizePath(Path.dirname(absolutePath))
    const relativeDir = normalizePath(Path.relative(root, absoluteDir))

    let outputPath = template.render(output, {
      name: parsed.name,
      nameWithExt: parsed.name + parsed.ext,
      ext: parsed.ext.substr(1),
      root: root,
      relativePath: relativePath,
      relativeDir: relativeDir + '/',
      absolutePath: absolutePath,
      absoluteDir: absoluteDir + '/',
      state: state
    })

    if (config.outputPathTrim) {
      outputPath = outputPath.replace(config.outputPathTrim, '')
    }

    if (outputPath.indexOf('/') === -1) {
      outputPath = Path.join(absoluteDir, outputPath)
    } else if (!Path.isAbsolute(outputPath)) {
      outputPath = Path.join(root, outputPath)
    }

    debug(`Saving ${relativePath} to ${normalizePath(Path.relative(root, outputPath))}`)
    return new Promise(function(resolve, reject) {
      FS.writeFile(outputPath, contents, function(err) {
        if (err) {
          reject(err)
        } else resolve(contents)
      })
    })
  }
}
