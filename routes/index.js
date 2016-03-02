var express = require('express')
var router = express.Router()
var marko = require('marko')
var debug = require('debug')('torrent-webseed:routes')
var fs = require('fs')
var magnet2torrent = require('../lib/magnet2torrent')
var webtorrent = require('webtorrent')

var WebTorrent = new webtorrent()

function showError(err, next) {
	next(err)
}

/* GET home page. */
router.get('/', function(req, res) {
	var indexTemplate = marko.load(require.resolve('../views/index.marko'));
	indexTemplate.render({
		$global: {locals: req.app.locals},
		title: 'Torrent Web Seed'
	}, res);
});

/* get .torrent file */
router.get('/torrent/:infoHash', function(req, res, next) {
	var infoHash = req.params.infoHash.replace(/\..*$/, ''),
		path = './cache/' + infoHash + '.torrent'

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

/* List torrent files */
router.get('/:infoHash', function(req, res) {
	var indexTemplate = marko.load(require.resolve('../views/index.marko'));
	indexTemplate.render({
		$global: {locals: req.app.locals},
		title: 'Torrent File Index'
	}, res);
});

/* webseed torrent file */
router.get('/:infoHash/:path', function(req, res) {
	var indexTemplate = marko.load(require.resolve('../views/index.marko'));
	indexTemplate.render({
		$global: {locals: req.app.locals},
		title: 'Seed files'
	}, res);
});

module.exports = router;
