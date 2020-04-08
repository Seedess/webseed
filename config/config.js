const configs = {
  localStorage: require('./localStorage'),
  memoryStorage: require('./memoryStorage'),
  allowedDomains: require('./allowedDomains')
}

/**
 * Sets the global configuration and returns it
 */
module.exports = function config(overrides) {
  if (overrides) {
    Object.keys(overrides).forEach(key => {
      Object.assign(configs[key], overrides[key])
    })
  }
  return configs
}