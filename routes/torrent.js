var express = require('express')
var router = express.Router()
var debug = require('debug')('seedess:webseed:torrent')
const torrentFileFromInfoHash = require('../lib/torrentFileFromInfoHash')

/* get .torrent file */
router.get('/:infoHash', function(req, res, next) {
	var infoHash = req.params.infoHash.replace(/\..*$/, '')
	debug('torrent file request', infoHash)
	torrentFileFromInfoHash(res, infoHash)
});

module.exports = router;
