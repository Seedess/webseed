var express = require('express')
var router = express.Router()
var marko = require('marko')
var debug = require('debug')('torrent-webseed:index')

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

module.exports = router;