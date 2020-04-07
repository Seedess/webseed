var express = require('express')
var router = express.Router()
var markdown = require('../middleware/markdown')
var fs = require('fs')
var debug = require('debug')('seedess:sever:index')

/* GET home page. */
router.get('/', markdown, function(req, res) {
	debug('getting /')
	res.markdown(fs.readFileSync(__dirname + '/../Readme.md').toString())
});


module.exports = router;