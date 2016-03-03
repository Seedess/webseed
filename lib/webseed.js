var debug = require('debug')('webtorrent:webseed')
var http = require('http')
var mime = require('mime')
var prettyBytes = require('pretty-bytes')
var pump = require('pump')
var rangeParser = require('range-parser')
var url = require('url')

function webSeed (torrent, path, req, res, next) {

  console.log('Request received for torrent webseed ' + torrent.name)

  // Allow CORS requests to specify arbitrary headers, e.g. 'Range',
  // by responding to the OPTIONS preflight request with the specified
  // origin and requested headers.
  if (req.method === 'OPTIONS' && req.headers['access-control-request-headers']) {
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      req.headers['access-control-request-headers']
    )
    res.setHeader('Access-Control-Max-Age', '1728000')
    return res.end()
  }

  if (req.headers.origin) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
  }

  if (path === '/favicon.ico') return res.end()

  if (torrent.ready) onReady()
  else torrent.once('ready', onReady)

  function onReady () {

    console.log('Torrent ready ', path)

    var file = false
    torrent.files.forEach(function(_file) {
      if (_file.path == path) {
        file = _file
        return false
      }
    })

    if (!file) {
      res.statusCode = 404
      return res.end('404 Not Found')
    }

    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Content-Type', mime.lookup(file.name))
    res.statusCode = 200

    // Support DLNA streaming
    res.setHeader('transferMode.dlna.org', 'Streaming')
    res.setHeader(
      'contentFeatures.dlna.org',
      'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000'
    )

    var range
    if (req.headers.range) {
      res.statusCode = 206
      // no support for multi-range reqs
      range = rangeParser(file.length, req.headers.range)[0]
      debug('range %s', JSON.stringify(range))
      res.setHeader(
        'Content-Range',
        'bytes ' + range.start + '-' + range.end + '/' + file.length
      )
      res.setHeader('Content-Length', range.end - range.start + 1)
    } else {
      res.setHeader('Content-Length', file.length)
    }
    if (req.method === 'HEAD') res.end()
    pump(file.createReadStream(range), res)
  }

}

module.exports = webSeed
