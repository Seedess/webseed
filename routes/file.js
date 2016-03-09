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
var path = require('path')

var client = new WebTorrent()
var file_path = path.resolve(__dirname, '../public/file/')

function showError(err, next) {
	next(err)
}

function onCompleteDestorySwarm(torrent) {
	var interval = 1000
	var timer = setInterval(function() {
		console.log('Torrent progress: ', torrent.name, Math.round(torrent.progress * 100) + '%')
		if (torrent.progress == 1) {
			clearInterval(timer)
			console.log('Destroying swarm, torrent fully downloaded.', torrent.name, torrent.path)
			torrent.swarm.destroy()
		}
	}, interval)
}

/* List torrent files /file/:infoHash */
router.get('/:infoHash', function(req, res, next) {
	var infoHash = req.params.infoHash,
		save_path = path.resolve(file_path + '/' + infoHash)

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

	console.log('Retrieving torrent metadata from bittorrent. Saving files to: ', save_path)
	client.add(infoHash, { path: save_path }, function(torrent) {
		console.log('got torrent metadata!')

		onCompleteDestorySwarm(torrent)

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
		_path = req.params[0],
		save_path = path.resolve(file_path + '/' + infoHash)

    console.log('GET file/:infoHash/:path ', infoHash, _path)
	if (infoHash.length != 40) {
		return showError(new Error('Invalid Infohash length'), next)
	}

	var torrent = client.get(infoHash)
	if (torrent) {
		console.log('Resuming webseed on existing torrent...')
		webseed(torrent, _path, req, res, next)
	} else {
		console.log('New webseed, saving to: ', save_path)
		client.add(infoHash, { path: save_path }, function(torrent) {

			onCompleteDestorySwarm(torrent)

			console.log('Got torrent metadata. Starting webseed on new torrent. ')
			webseed(torrent, _path, req, res, next)
		})
	}
	
});

module.exports = router;
