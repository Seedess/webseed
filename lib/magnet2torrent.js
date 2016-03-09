var path = require('path')
var WebTorrent = require('webtorrent')
var store = require('memory-chunk-store')
var timeout = 10000

module.exports = function magnet2torrent(magnet, callback) {
  var err,
    timer

  try {
    var client = new WebTorrent({store: store})
    client.add(magnet, onTorrent)
  } catch(err) {
    callback(err)
  }

  function onTorrent(torrent) {
    var file = torrent.torrentFile
    callback(null, file)
    console.log('Destroying torrent')
    torrent.swarm.destroy()
    torrent.destroy()
    client.destroy()
  }

}
