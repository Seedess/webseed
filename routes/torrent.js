var express = require('express')
var router = express.Router()
var marko = require('marko')
var debug = require('debug')('webseed:torrent')
var fs = require('fs')
var magnet2torrent = require('../lib/magnet2torrent')

function showError(err, next) {
	next(err)
}

// route torrent/*

/* get .torrent file */
router.get('/:infoHash', function(req, res, next) {
	var infoHash = req.params.infoHash.replace(/\..*$/, ''),
		path = './cache/' + infoHash + '.torrent'

	console.log('Requesting torrent file: ', infoHash + '.torrent')

	if (infoHash.length != 40) {
		return showError(new Error('Invalid Infohash length'), next)
	}

	function sendTorrentFile() {
		magnet2torrent(infoHash, function(err, torrentFile) {
			if (err) {
				return showError(err, next)
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

	fs.access(path, fs.R_OK, function(err) {
		var sent = false
		if (!err) {
			fs.readFile(path, function(err, data) {
				if (err) {
					debug('Error reading torrent file from cache ' + path)
					sendTorrentFile()
					return
				}
				debug('Torrent file read from cache ' + path)
				res.header("content-disposition", 'attachment; filename="' + infoHash + '.torrent"')
				res.send(data)
				sent = true
			})
		} else {
			sendTorrentFile()
		}
	})
});


module.exports = router;
