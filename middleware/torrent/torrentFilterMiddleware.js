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


/**
 * Torrent blacklist middleware
 * @throws When torrent is blacklisted
 * @returns {next} when not blacklisted
 */
async function torrentFilterMiddleware(req, res, next) {
  var infoHash = new String(req.params.infoHash).toLowerCase()
  if (infoHash) {
    var isBlacklist = await isTorrentInBlacklist(infoHash)
    if (isBlacklist) {
      throw new Error('Torrent is blacklisted')
    }
  }
  return next
}

module.exports = { torrentFilterMiddleware, isTorrentInBlacklist }