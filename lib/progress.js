var path = require('path')
var prettyBytes = require('pretty-bytes')
var cliBuffer = require('./cliBuffer')
var cliBuf = new cliBuffer()

cliBuf.line('')
var totalProgressLine = cliBuf.line('Starting Torrents..')
cliBuf.line('')

function torrenProgress(client, torrent) {
  var torrentFileName = path.basename(torrent.name, path.extname(torrent.name)) + '.torrent'
  var progressLine = cliBuf.line()

  // todo: Update speed via single setInterval to run for all torrents
  function updateSpeed () {
    var progress = (100 * torrent.progress).toFixed(1)
    var progressTotal = 0
    client.torrents.forEach(function(torrent) {
      progressTotal += torrent.progress
    })
    progressTotal = (100 * progressTotal/client.torrents.length).toFixed(1)

    if (!opts.q) {

      totalProgressLine.update(
        'Active Torrents: ' + client.torrents.length + ' ' +
        'Progress: ' + progressTotal + '% ' +
        'Download speed: ' + prettyBytes(client.downloadSpeed) + '/s ' +
        'Upload speed: ' + prettyBytes(client.uploadSpeed) + '/s')

      progressLine.update(
        'Torrent Name: "' + (torrentFileName).replace(/[^a-z0-9\-\.\+]/ig, ' ') + '" ' +
        'Magnet: ' + torrent.infoHash + ' ' +
        'Peers:' + torrent.swarm.wires.length + ' ' +
        'Progress: ' + progress + '% ' +
        'Download speed: ' + prettyBytes(torrent.downloadSpeed) + '/s ' +
        'Upload speed: ' + prettyBytes(torrent.uploadSpeed) + '/s'
      )
    }
  }

  updateSpeed()
  setInterval(updateSpeed, 5000)
}

module.exports = torrenProgress