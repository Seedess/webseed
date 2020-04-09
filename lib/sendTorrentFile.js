/**
 * Sends the torrent file as attachment
 * @param {Expresss.Response} res
 * @param {object} torrentInfo (from parse-torrent)
 * @param {Blob|Stream} torrent .torrent file
 */
module.exports = function sendTorrentFile(res, torrentInfo, torrent, { format, filename }) {
  if (format === 'json') {
    const json = { ...torrentInfo }
    delete json.infoBuffer
    delete json.infoHashBuffer
    json.info.name = json.info.name.toString()
    delete json.info.pieces
    return res.json(json)
  }
  res.header("content-disposition", 'attachment; filename="' + (filename || torrentInfo.infoHash) + '.torrent"')
  res.send(torrent)
}