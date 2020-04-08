var express = require('express')
var router = express.Router()
var debug = require('debug')('seedess:webseed:torrent')
var fs = require('fs')
var magnet2torrent = require('../lib/magnet2torrent')

/**
 * Retrieves torrent info from bitTorrent and sends to HTTP Response
 * @note this is slow and can fail if no peers are available
 * @param {string} infoHash 
 * @param {express.Response} res 
 */
function sendTorrentFileFromPeers(infoHash, res, path) {
	debug('sendTorrentFileFromPeers with magnet2torrent', infoHash)
	magnet2torrent(infoHash, function(err, torrentFile) {
		debug('magnet2torrent callback', { infoHash, err, torrentFile })
		if (err) {
			return next(err)
		}
		debug('Torrent file received from peer metadata: ', torrentFile)
		fs.writeFile(path, torrentFile, function(err) {
			if (err) {
				debug('Error writing torrent file to cache ' + path)
			}
		})
		res.header("content-disposition", 'attachment; filename="' + infoHash + '.torrent"')
		res.send(torrentFile)
	})
}

/* get .torrent file */
router.get('/:infoHash', function(req, res, next) {
	var infoHash = req.params.infoHash.replace(/\..*$/, ''),
		path = './public/torrent/' + infoHash + '.torrent'

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
});


module.exports = router;
