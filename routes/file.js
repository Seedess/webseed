var express = require('express')
var router = express.Router()
var marko = require('marko')
var debug = require('debug')('torrent-webseed:file')
var fs = require('fs')
var magnet2torrent = require('../lib/magnet2torrent')
var WebTorrent = require('webtorrent')
var store = require('memory-chunk-store')
var webseed = require('../lib/webseed')
var prettyBytes = require('pretty-bytes')

var client = new WebTorrent({store: store })

function showError(err, next) {
	next(err)
}

/* List torrent files /file/:infoHash */
router.get('/:infoHash', function(req, res, next) {
	var infoHash = req.params.infoHash

	console.log('GET  file/:infoHash ', infoHash)
	if (infoHash.length != 40) {
		return showError(new Error('Invalid Infohash length'), next)
	}

	// resume webseed if we have only one file and torrent exists
	var torrent = client.get(infoHash)
	if (torrent && torrent.files.length == 1) {
		console.log('Resuming webseed on existing torrent...')
		webseed(torrent, torrent.files[0].path, req, res, next)
		return
	}

	console.log('Retrieving torrent metadata from bittorrent')
	client.add(infoHash, function(torrent) {
		console.log('got torrent metadata!')

		// if only one file, webseed it directly
		if (torrent.files.length == 1) {
			webseed(torrent, torrent.files[0].path, req, res, next)
			return
		}

		res.setHeader('Content-Type', 'text/html')
		var listHtml = torrent.files.map(function (file, i) {
		return '<li><a download="' + file.name + '" href="/' + i + '">' + file.path + '</a> ' +
		 	'(' + prettyBytes(file.length) + ')</li>'
		}).join('<br>')

		var html = '<h1>' + torrent.name + '</h1><ol>' + listHtml + '</ol>'
		return res.end(html)
	})
});

/* webseed torrent file /file/:infoHash/path/to/file.ext */
router.get('/:infoHash/*', function(req, res, next) {
	var infoHash = req.params.infoHash,
		path = req.params[0]

    console.log('GET file/:infoHash/:path ', infoHash, path)
	if (infoHash.length != 40) {
		return showError(new Error('Invalid Infohash length'), next)
	}

	var torrent = client.get(infoHash)
	if (torrent) {
		console.log('Resuming webseed on existing torrent...')
		webseed(torrent, path, req, res, next)
	} else {
		client.add(infoHash, function(torrent) {
			console.log('Got torrent metadata. Starting webseed on new torrent. ')
			webseed(torrent, path, req, res, next)
		})
	}
	
});

module.exports = router;
