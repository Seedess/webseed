var magnet2torrent = require('../lib/magnet2torrent')
const debug = require('debug')('seedess:webseed:sendTorrentFileFromPeers')

/**
 * Retrieves torrent info from bitTorrent and sends to HTTP Response
 * @note this is slow and can fail if no peers are available
 * @param {string} infoHash 
 * @param {express.Response} res 
 */
module.exports = function sendTorrentFileFromPeers(infoHash, res, path) {
 debug('sendTorrentFileFromPeers with magnet2torrent', infoHash)
 magnet2torrent(infoHash, function(err, torrentFile) {
   debug('magnet2torrent callback', { infoHash, err, torrentFile })
   if (err) {
     return next(err)
   }
   debug('Torrent file received from peer metadata: ', torrentFile)
   fs.writeFile(path, torrentFile, function(err) {
     if (err) {
       debug('Error writing torrent file to cache ' + path)
     }
   })
   res.header("content-disposition", 'attachment; filename="' + infoHash + '.torrent"')
   res.send(torrentFile)
 })
}