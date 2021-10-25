var debug = require('debug')('seedess:middleware:torrentFilter')

/**
 * Blacklist of torrents by infoHash in each line of file
 */
var blacklistFile = require('path').join(__dirname, 'torrent-blacklist.txt')
async function isTorrentInBlacklist(infoHash) {
  return new Promise(async (resolve) => {
    var readInterface = require('readline').createInterface({
      input: require('fs').createReadStream(blacklistFile),
      console: false
    });
    for await (const line of readInterface) {
      if (line === infoHash) resolve(true)
    }
    resolve(false)
  })
}

function matchInfoHashFromUrl(url) {
  const matches = url.match(/[a-f0-9]{40}/)
  return matches ? matches[0] : false
}


/**
 * Torrent blacklist middleware
 * @throws When torrent is blacklisted
 * @returns {next} when not blacklisted
 */
async function torrentFilterMiddleware(req, res, next) {
  var url = req.originalUrl
  var infoHash = matchInfoHashFromUrl(url)
  debug('torrentFilterMiddleware', { infoHash })
  if (infoHash) {
    var isBlacklist = await isTorrentInBlacklist(infoHash)
    debug('torrentFilterMiddleware', { infoHash, isBlacklist })
    if (isBlacklist) {
      return next(new Error('Torrent is blacklisted'))
    }
  }
  next()
}

module.exports = { torrentFilterMiddleware, isTorrentInBlacklist }