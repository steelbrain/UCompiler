'use babel'

export function execute({plugins, contents}) {
  // Sequence:
  // 1. Compilers
  // 2. General
  // 3. Minifiers
  return []
    .concat(plugins.compilers)
    .concat(plugins.general)
    .concat(plugins.minifiers)
    .reduce(function(promise, plugin) {
      return promise.then(function(contents) {
        return plugin.process({contents})
      })
    }, Promise.resolve(contents))
}
