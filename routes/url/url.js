const express = require('express')
const router = express.Router()
const debug = require('debug')('seedess:webseed:url')
const configs = require('../../config')()
const parseTorrent = require('../../lib/parseTorrent')
const isAllowedUrlDomain = require('../../lib/isAllowedUrlDomain')
const { allowedDomains } = configs
const sendTorrentFile = require('../../lib/sendTorrentFile')
const TorrentFileCache = require('../../lib/TorrentFileCache')

// keep cache outside router to share between routes
const cache = new TorrentFileCache()

/**
 * Get the torrent file for the URL
 * @example /url/{videoUrl}
 * @example /?url={videoUrl}
 */
router.get(['/', '/:url'], async function(req, res, next) {
  const { url, format } = { ...req.params, ...req.query }

  debug('Requesting torrent from url: ', url)

  const allowedDomain = isAllowedUrlDomain(url, allowedDomains)
  if (!allowedDomain) {
    return next(new TypeError('URL is not in the allowed domains list'))
  }
  debug('Allowing torrent from url', url, 'matching ', allowedDomain)
  
  let torrent = await cache.getTorrentFileByUrl(url)

	if (torrent) {
    debug('Found torrent', torrent)
    const torrentInfo = parseTorrent(torrent)
    //return sendTorrentFile(res, torrentInfo, torrent, { format })
  }

  torrent = await cache.createTorrentFileFromUrl(url)
  const torrentInfo = parseTorrent(torrent)
  sendTorrentFile(res, torrentInfo, torrent, { format })
  
});


module.exports = router;
