
const fs = require('fs')
const sendTorrentFileFromPeers = require('../lib/sendTorrentFileFromPeers')
const debug = require('debug')('seedess:webseed:torrentFileFromInfoHash')

module.exports = function torrentFileFromInfoHash(res, infoHash) {
  const path = './public/torrent/' + infoHash + '.torrent'

	debug('Requesting torrent file: ', infoHash + '.torrent')

	if (infoHash.length != 40) {
		return next(new Error('Invalid Infohash length'))
	}

	fs.access(path, fs.R_OK, function(err) {
		if (!err) {
			fs.readFile(path, function(err, data) {
				if (err) {
					debug('Error reading torrent file from cache ' + path)
					sendTorrentFileFromPeers(infoHash, res, path)
					return
				}
				debug('Torrent file read from cache ' + path)
				res.header("content-disposition", 'attachment; filename="' + infoHash + '.torrent"')
				res.send(data)
				sent = true
			})
		} else {
			sendTorrentFileFromPeers(infoHash, res, path)
		}
	})
}