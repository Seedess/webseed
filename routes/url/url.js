const express = require('express')
const router = express.Router()
const debug = require('debug')('seedess:webseed:url')
const configs = require('../../config')()
const memoryStorage = configs.memoryStorage()
const createTorrent = require('../../lib/createTorrent')
const parseTorrent = require('../../lib/parseTorrent')
const FetchStream = require("fetch").FetchStream
const isAllowedUrlDomain = require('../../lib/isAllowedUrlDomain')
const { allowedDomains } = configs
const sendTorrentFile = require('../../lib/sendTorrentFile')
const TorrentFileCache = require('../../lib/TorrentFileCache')

/**
 * Get the torrent file for the URL
 * @example /url/{videoUrl}
 * @example /?url={videoUrl}
 */
router.get(['/', '/:url'], async function(req, res, next) {
  const { url, format } = { ...req.params, ...req.query }

  
  debug('Requesting torrent from url: ', url)

  const cache = new TorrentFileCache()

  const allowedDomain = isAllowedUrlDomain(url, allowedDomains)
  if (!allowedDomain) {
    return next(new TypeError('URL is not in the allowed domains list'))
  }
  debug('Allowing torrent from url', url, 'matching ', allowedDomain)
  
  const torrent = await cache.getTorrentFileByUrl(url)

	if (torrent) {
    debug('Found torrent', torrent)
    const torrentInfo = parseTorrent(torrent)
    return sendTorrentFile(res, torrentInfo, torrent, { format })
  }

  // ensure we only have one stream to a url per server
  let stream = await memoryStorage.getItem('url:stream:' + url)
  if (!stream) {
    debug('Fetching file stream from', url)
    stream = new FetchStream(url)
    memoryStorage.setItem('url:stream:' + url, stream)
  }

  debug('We should have a stream', { stream })

  const torrentOpts = { name: url.split('/').pop() }
  createTorrent(stream, torrentOpts, (err, torrent) => {
    if (err) return next(err)
    const torrentInfo = parseTorrent(torrent)
    // stream and save torrentInfo in parallel
    cache.setTorrentFileByUrl(url, torrent)
    return sendTorrentFile(res, torrentInfo, torrent, { format })
  })
  
});


module.exports = router;
