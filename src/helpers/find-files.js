'use babel'

import FS from 'fs'
import Path from 'path'
import {isMatch} from 'micromatch'
import isGlob from 'is-glob'
import {DEFAULT_IGNORED} from '../defaults'
import {isIgnored, normalizePath} from './common'

export function findFiles(pathGiven, ignoredGiven, options) {
  const ignored = DEFAULT_IGNORED.concat(ignoredGiven)

  if (pathGiven === null) {
    return findFilesConfig(ignored, options)
  } else if (isGlob(pathGiven)) {
    return findFilesGlob(pathGiven, ignored, options)
  } else {
    const path = normalizePath(Path.isAbsolute(pathGiven) ? pathGiven : Path.join(options.cwd, pathGiven))
    const stat = FS.statSync(path)

    if (stat.isFile()) {

      const fileName = Path.basename(path)
      if (isIgnored(fileName, path, ignored)) {
        return []
      }

      return [{
        relativePath: normalizePath(Path.relative(options.cwd, path)),
        absolutePath: path,
        fileName: fileName
      }]

    } else if (stat.isDirectory()) {
      return findFilesRegular(path, ignored, options)
    } else {
      throw new Error(`${path} is neither a file nor a directory`)
    }
  }
}

export function findFilesBase(path, ignored, {root, config}, validateCallback) {
  let files = []

  FS.readdirSync(path).forEach(function(entryName) {
    const absolutePath = normalizePath(Path.join(path, entryName))
    const relativePath = normalizePath(Path.relative(root, absolutePath))
    const stat = FS.lstatSync(absolutePath)

    if (entryName.substr(0, 1) === '.' ||
        stat.isSymbolicLink() ||
        isIgnored(entryName, relativePath, ignored)) {
      return
    }

    if (validateCallback === null || validateCallback(relativePath, entryName, stat)) {
      if (stat.isDirectory()) {
        files = files.concat(findFilesBase(absolutePath, ignored, {root, config}, validateCallback))
      } else if (stat.isFile()) {
        files.push({relativePath, absolutePath, fileName: entryName})
      }
    }
  })

  return files
}

export function findFilesRegular(path, ignored, {root, config}) {
  return findFilesBase(path, ignored, {root, config}, null)
}

export function findFilesGlob(path, ignored, {root, config}) {
  return findFilesBase(root, ignored, {root, config}, function(relative, _, stat) {
    return stat.isDirectory() || isMatch(relative, path)
  })
}

export function findFilesConfig(ignored, {root, config}) {
  const paths = []
  config.rules.forEach(function(rule) {
    paths.push(rule.path)
  })
  return findFilesBase(root, ignored, {root, config}, function(relativePath, fileName, stat) {
    return stat.isDirectory() || isIgnored(fileName, relativePath, paths)
  })
}
