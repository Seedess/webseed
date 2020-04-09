var express = require('express')
var router = express.Router()
var debug = require('debug')('seedess:webseed:torrent')
const sendTorrentFileFromInfoHash = require('../../lib/sendTorrentFileFromInfoHash')

const configs = require('../../config')()
const localStorage = configs.localStorage()
const memoryStorage = configs.memoryStorage()
const { allowedDomains } = configs
const createTorrent = require('../../lib/createTorrent')
const parseTorrent = require('../../lib/parseTorrent')
const FetchStream = require("fetch").FetchStream
const sendTorrentFile = require('../../lib/sendTorrentFile')
const isAllowedUrlDomain = require('../../lib/isAllowedUrlDomain')

/**
 * Get the torrent file for the URL
 * @example /create?url={url}
 */
router.get('/create', async function(req, res, next) {
  const { url } = req.query

  debug('Requesting torrent from url: ', url)

  const allowedDomain = isAllowedUrlDomain(url, allowedDomains)
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

/* get .torrent file */
router.get('/:infoHash', function(req, res, next) {
	var infoHash = req.params.infoHash.replace(/\..*$/, '')
	debug('torrent file request', infoHash)
	sendTorrentFileFromInfoHash(res, infoHash)
});

module.exports = router;
