var express = require('express')
var router = express.Router()
var marko = require('marko')
var debug = require('debug')('seedess:sever:index')

/* GET home page. */
router.get('/', function(req, res) {
	debug('getting /')
	var indexTemplate = marko.load(require.resolve('../views/index.marko'));
	indexTemplate.render({
		$global: {locals: req.app.locals},
		title: 'Seedess Torrent Server'
	}, res);
});

module.exports = router;