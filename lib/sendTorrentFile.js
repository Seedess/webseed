/**
 * Sends the torrent file as attachment
 * @param {Expresss.Response} res
 * @param {object} torrentInfo (from parse-torrent)
 * @param {Blob|Stream} torrent .torrent file
 */
module.exports = function sendTorrentFile(res, torrentInfo, torrent, filename = null) {
  res.header("content-disposition", 'attachment; filename="' + (filename || torrentInfo.infoHash) + '.torrent"')
  res.send(torrent)
}