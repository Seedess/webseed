const express = require('express')
const router = express.Router()
const debug = require('debug')('seedess:webseed:url')
const configs = require('../../config')()
const localStorage = configs.localStorage()
const memoryStorage = configs.memoryStorage()
const { allowedDomains } = configs
const createTorrent = require('../../lib/createTorrent')
const parseTorrent = require('../../lib/parseTorrent')
const FetchStream = require("fetch").FetchStream

function isAllowedUrlDomain(url) {
  const urlInfo = new URL(url)
  return allowedDomains.find(hostname => hostname === urlInfo.hostname)
}

function sendTorrentFile(res, torrentInfo, torrent) {
  res.header("content-disposition", 'attachment; filename="' + torrentInfo.infoHash + '.torrent"')
  res.send(torrent)
}

/**
 * Get the torrent file for the URL
 */
router.get('/:url', async function(req, res, next) {
  const { url } = req.params

  debug('Requesting torrent from url: ', url)

  const allowedDomain = isAllowedUrlDomain(url)
  if (!allowedDomain) {
    return next(new TypeError('URL is not in the allowed domains list'))
  }
  debug('Allowing torrent from url', url, 'found in ', allowedDomain)
  
  const torrentInfo = await localStorage.getItem('url:torrent:' + url)

	if (torrentInfo) {
    debug('Found torrentInfo', torrentInfo)
    torrentInfo.created = new Date(torrentInfo.created)
    const torrent = parseTorrent.toTorrentFile(torrentInfo)
    return sendTorrentFile(res, torrentInfo, torrent)
  }

  // ensure we only have one stream to a url per server
  let stream = await memoryStorage.getItem('url:stream:' + url)
  if (!stream) {
    debug('Fetching file stream from', url)
    stream = new FetchStream(url)
    await memoryStorage.setItem('url:stream:' + url, stream)
  }
  debug('We should have a stream', stream)

  const torrentOpts = { name: url.split('/').pop() }
  createTorrent(stream, torrentOpts, (err, torrent) => {
    if (err) return next(err)
    const torrentInfo = parseTorrent(torrent)
    // stream and save torrentInfo in parallel
    localStorage.setItem('url:torrent:' + url, torrentInfo)
    return sendTorrentFile(res, torrentInfo, torrent)
  })
  
});


module.exports = router;
