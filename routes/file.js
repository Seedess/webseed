var express = require('express')
var router = express.Router()
var marko = require('marko')
var debug = require('debug')('torrent-webseed:file')
var fs = require('fs-extra')
var magnet2torrent = require('../lib/magnet2torrent')
var WebTorrent = require('webtorrent')
var store = require('memory-chunk-store')
var webseed = require('../lib/webseed')
var prettyBytes = require('pretty-bytes')
var path = require('path')

const maxConns = 100
const maxLifetime = 5*1000 // ms

let timeouts = {} // torrent lifetime timeouts

// todo: set maxConns per torrent depending on load
var client = new WebTorrent({
  maxConns: getOptimalMaxConnsPerTorrent(1, maxConns),  // limit connections per torrent for mem usage
})
var file_save_path = path.resolve(__dirname, '../public/file/')

// cleanup and progress display
onCompleteDestorySwarm(client)

function showError(err, next) {
	next(err)
}

function getOptimalMaxConnsPerTorrent(numTorrents, maxConns) {
	return Math.ceil((maxConns - (maxConns / ( (numTorrents + 10) * .1))) / numTorrents)
}

function selectFiles(torrent, selected_files = []) {
	// Remove default selection (whole torrent)
  torrent.deselect(0, torrent.pieces.length - 1, false)

  // Add selections (individual files)
  for (let i = 0; i < selected_files.length; i++) {
    const file = torrent.files[i]
    if (selected_files.indexOf(file) != -1) {
    	debug('selecting file ' + file.name + ' of torrent ' + torrent.name)
      file.select()
    } else {
      debug('deselecting file ' + i + ' of torrent ' + torrent.name)
      file.deselect()
    }
  }
}

function getFileByPath(torrent, path) {
	torrent.files.forEach(file => {
		if (file.path == path) {
			return file
		}
	})
}

function onCompleteDestorySwarm(client) {
	var interval = 5000
	var timer = setInterval(function() {

		if (client.torrents.length) {
			const numTorrents = client.torrents.length
			const numPeers = client.torrents.reduce((sum, torrent) => sum + torrent.numPeers, 0)
			client.maxConns = getOptimalMaxConnsPerTorrent(numTorrents, maxConns)

			debug('Progress: ', numTorrents + ' torrents.', 
				'Peers:', numPeers,
				'maxConns:', client.maxConns,
				'progress:', parseFloat(client.progress * 100).toFixed(2) + '%', 
				'downloaded', prettyBytes(client.torrents.reduce((sum, torrent) => sum + torrent.received, 0)),
				'download speed:', prettyBytes(client.downloadSpeed), 
				'upload speed:', prettyBytes(client.uploadSpeed))
			client.torrents.forEach(torrent => {
				debug(torrent.name, 
					'progress:', parseFloat(torrent.progress * 100).toFixed(2) + '%', 
					'speed: ^' + prettyBytes(torrent.uploadSpeed) + ' / ' + prettyBytes(torrent.downloadSpeed),
					'peers:', torrent.numPeers, 
					'ratio:', parseFloat(torrent.ratio).toFixed(2),
					'downloaded:', prettyBytes(torrent.received),
					'uploaded:', prettyBytes(torrent.uploaded),
					'infoHash:', torrent.infoHash, 
					'path:', torrent.path)

				if (torrent.progress == 1) {
					debug('Destroying swarm, torrent fully downloaded.', torrent.name, torrent.path)
					torrent.destroy()

					var torrent_save_path = path.resolve(file_save_path + '/' + torrent.infoHash)
					var torrent_cache_path = torrent.path

					debug('Moving torrent to public folder: ', torrent.infoHash, torrent_cache_path, torrent_save_path)

					// symlink the tmp cached file
					fs.ensureSymlink(torrent_cache_path, torrent_save_path, function(err) {
						if (err) debug(err)
					})
				}
			})
		}
		

	}, interval)
}

// destroys torrents not requested after some time
function renewTorrentLifetime(torrent) {
	clearTimeout(timeouts[torrent.infoHash])
	timeouts[torrent.infoHash] = setTimeout(() => {
		if (!torrent || torrent.destroyed) return debug('Torrent already destroyed')
		debug('Destroying torrent ', torrent.infoHash, torrent.name, ' max lifetime ', maxLifetime/1000 + 'secs')
		//client.remove(torrent.infoHash) // fixme
		//selectFiles(torrent, []) // remove when client.remove() doesn't cause errors
	}, maxLifetime)
}

/* List torrent files /file/:infoHash */
router.get('/:infoHash', function(req, res, next) {
	var infoHash = new String(req.params.infoHash).toLowerCase()

	debug('GET  file/:infoHash ', infoHash)
	if (infoHash.length != 40) {
		return showError(new Error('Invalid Infohash length'), next)
	}

	var sendResp = (torrent) => {
		res.setHeader('Content-Type', 'text/html')
		var listHtml = torrent.files.map(function (file, i) {
		return '<li><a download="' + file.name + '" href="/file/' + infoHash + '/' + file.path + '">' + file.path + '</a> ' +
		 	'(' + prettyBytes(file.length) + ')</li>'
		}).join('<br>')

		var html = '<h1>' + torrent.name + '</h1><ol>' + listHtml + '</ol>'
		return res.end(html)
	}

	// torrent already exists in client. Send metadata when ready
	var torrent = client.get(infoHash)
	if (torrent) {
		debug('Existing torrent, sending metadata ', infoHash)
		renewTorrentLifetime(torrent)
		sendResp(torrent)
		return
	}

	debug('New torrent, retrieving metadata ', infoHash)
	client.add(infoHash, { store: store }, function(torrent) {
		debug('got torrent metadata!')
		renewTorrentLifetime(torrent)

		torrent.pause() // stop adding peers
		selectFiles(torrent, []) // deselect/deprioritize whole torrent

		sendResp(torrent)
	})
});

/* webseed torrent file /file/:infoHash/path/to/file.ext */
router.get('/:infoHash/*', function(req, res, next) {
	var infoHash = new String(req.params.infoHash).toLowerCase(),
		_path = req.params[0]

    debug('GET file/:infoHash/:path ', infoHash, _path)
	if (infoHash.length != 40) {
		return showError(new Error('Invalid Infohash length'), next)
	}

	var torrent = client.get(infoHash)
	if (torrent) {
		debug('Resuming webseed on existing torrent... ', infoHash, _path)

		renewTorrentLifetime(torrent)

		webseed(torrent, _path, req, res, next)
	} else {
		debug('New webseed: ', infoHash, _path)
		client.add(infoHash, function(torrent) {

			renewTorrentLifetime(torrent)

			// select only requested file
			selectFiles(torrent, [getFileByPath(torrent, _path)])

			debug('Got torrent metadata. Starting webseed on new torrent. ', infoHash, _path)
			webseed(torrent, _path, req, res, next)
		})
	}
	
});

module.exports = router;
