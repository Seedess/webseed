const fs = require('fs')
const path = require('path')
const configs = require('../config')()
const localStorage = configs.localStorage()
const parseTorrent = require('../lib/parseTorrent')
const memoryStorage = configs.memoryStorage()
const createTorrent = require('../lib/createTorrent')

const FetchStream = require("fetch").FetchStream

const debug = require('debug')('seedess:webseed:TorrentFileCache')

module.exports = class TorrentFileCache {

  constructor(cacheDirectory) {
    this.cacheDirectory = cacheDirectory || path.resolve(__dirname + '/../cache/torrent')
  }

  _getCachePath(infoHash) {
    return path.resolve(this.cacheDirectory + '/' + infoHash + '.torrent')
  }

  /**
   * Retrieve cached .torrent file given it's infoHash
   * @param {string} infoHash
   * @return {Promise<ReadableStream|null>} 
   */
  async getTorrentFileByInfoHash(infoHash) {
    debug('getTorrentFileByInfoHash', infoHash)
    if (infoHash.length != 40) {
      cb(new Error('Invalid Infohash length'))
    }
    const path = this._getCachePath(infoHash)
    debug('Requesting torrent file: ', infoHash, path)
    return new Promise(resolve => {
      const exists = fs.existsSync(path)
      resolve(exists ? fs.readFileSync(path) : null)
    })
  }

  /**
   * Write torrent file to disk indexed by infoHash
   * @param {string} infoHash 
   * @param {string|Buffer} torrent
   * @return {Promise<string>} path
   */
  async setTorrentFileByInfoHash(infoHash, torrent) {
    debug('setTorrentFileByInfoHash', infoHash, torrent)
    if (infoHash.length != 40) {
      cb(new Error('Invalid Infohash length'))
    }
    const path = this._getCachePath(infoHash)
    return new Promise((resolve, reject) => {
      fs.writeFile(path, torrent, error => {
        if (error) reject(error)
        resolve(path)
      })
    })
  }

  /**
   * Retrieve cached .torrent file given it's url
   * @param {string} url
   * @return {Promise<ReadableStream|null>} 
   */
  async getTorrentFileByUrl(url) {
    debug('getTorrentFileByUrl', url)
    const infoHash = await localStorage.getItem('url:infoHash:' + url)
    return infoHash ? this.getTorrentFileByInfoHash(infoHash) : null
  }

  /**
   * Write torrent file to disk indexed by url -> infoHash
   * @param {string} url 
   * @param {string|Buffer} torrent
   * @return {Promise<string>} path
   */
  async setTorrentFileByUrl(url, torrent) {
    debug('setTorrentFileByUrl', url, torrent)
    const { infoHash } = parseTorrent(torrent)
    await localStorage.setItem('url:infoHash:' + url, infoHash)
    return this.setTorrentFileByInfoHash(infoHash, torrent)
  }

  /**
   * Create torrent file from url
   * @note Ensures a single process in memory
   * @param {string} url 
   * @param {any} torrentOpts 
   * @return {Promise<string>} path
   */
  async createTorrentFileFromUrl(url, torrentOpts) {
    debug('createTorrentFileFromUrl', url, torrentOpts)

    // ensure we re-use existing process task for same url
    const existingProcess = await memoryStorage.getItem('url:torrent:p:' + url)
    if (existingProcess) return existingProcess

    const name = url.split('/').pop()
    const defaultOpts = { name, urlList: [ url ], pieceLength: 1048576 }
    torrentOpts = Object.assign(defaultOpts, torrentOpts)
    
    const processPromise = new Promise((resolve, reject) => {
      debug('Fetching file stream from', url)
      const stream = new FetchStream(url)
      createTorrent(stream, torrentOpts, (err, torrent) => {
        if (err) return reject(err)
        // save torrentInfo in parallel
        this.setTorrentFileByUrl(url, torrent)
        resolve(torrent)
      })
    })

    memoryStorage.setItem('url:torrent:p:' + url, processPromise)

    return processPromise
  }

}