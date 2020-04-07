var WebTorrent = require('webtorrent')
var store = require('memory-chunk-store')

module.exports = function magnet2torrent(magnet, callback) {
  try {
    var client = new WebTorrent()
    client.add(magnet, {store: store}, onTorrent)
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
