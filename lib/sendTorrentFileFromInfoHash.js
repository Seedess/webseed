
const fs = require('fs')
const sendTorrentFileFromPeers = require('./sendTorrentFileFromPeers')
const sendTorrentFile  = require('./sendTorrentFile')
const debug = require('debug')('seedess:webseed:torrentFileFromInfoHash')

module.exports = function sendTorrentFileFromInfoHash(res, infoHash) {
  const path = './cache/torrent/' + infoHash + '.torrent'

	debug('Requesting torrent file: ', infoHash + '.torrent')

	if (infoHash.length != 40) {
		return next(new Error('Invalid Infohash length'))
	}

	fs.access(path, fs.R_OK, function(err) {
		if (!err) {
			sendTorrentFile(res, { infoHash }, fs.createReadStream(path))
		} else {
			sendTorrentFileFromPeers(infoHash, res, path)
		}
	})
}