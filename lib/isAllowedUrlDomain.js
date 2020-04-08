const minimatch = require("minimatch")
const debug = require('debug')('seedess:webseed:isAllowedUrlDomain')

// polyfill URL
if (typeof URL === 'undefined') {
  URL = function(url) { return require('url').parse(url) }
}

/**
 * Tests the url domain matches with a list of domain|pattern
 * @param {string} url
 * @param {Array} [domains]
 */
module.exports = function isAllowedUrlDomain(url, allowedDomains) {
  const urlInfo = new URL(url)
  debug('isAllowedUrlDomain', urlInfo, allowedDomains)
  return allowedDomains.find(pattern => {
    return pattern === urlInfo.hostname
      || minimatch(urlInfo.hostname, pattern, {matchBase: true})
  })
}