
const fs = require('fs')
const sendTorrentFileFromPeers = require('../lib/sendTorrentFileFromPeers')
const debug = require('debug')('seedess:webseed:torrentFileFromInfoHash')

module.exports = function torrentFileFromInfoHash(res, infoHash) {
  const path = './cache/torrent/' + infoHash + '.torrent'

	debug('Requesting torrent file: ', infoHash + '.torrent')

	if (infoHash.length != 40) {
		return next(new Error('Invalid Infohash length'))
	}

	fs.access(path, fs.R_OK, function(err) {
		if (!err) {
			res.header("content-disposition", 'attachment; filename="' + infoHash + '.torrent"')
			res.send(fs.createReadStream(path))
		} else {
			sendTorrentFileFromPeers(infoHash, res, path)
		}
	})
}