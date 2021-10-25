var { isTorrentInBlacklist, torrentFilterMiddleware } = require('../torrentFilterMiddleware')
var infoHash = 'ec4d759c6105ef49b56a69fdc08dbb8df07a126f'

/**
 * @see https://jestjs.io/docs/tutorial-async
 */
describe('torrentsFileterMiddleware', () => {

  it('Return true when blacklisted', async () => {
    expect(await isTorrentInBlacklist(infoHash)).toBe(true)
  })

  it('Middleware calls next', async () => {
    await torrentFilterMiddleware({ originalUrl: 'non-blacklisted-infohash' }, null, err => {
      expect(err).toEqual(undefined)
    })
  })

  it('Middleware throws when torrent blacklisted', async () => {
    await torrentFilterMiddleware({ originalUrl: 'file/' + infoHash }, null, err => {
      expect(err).toEqual(new Error('Torrent is blacklisted'))
    })
  })
})