var { isTorrentInBlacklist, torrentFilterMiddleware } = require('../torrentFilterMiddleware')
var infoHash = 'ec4d759c6105ef49b56a69fdc08dbb8df07a126f'

/**
 * @see https://jestjs.io/docs/tutorial-async
 */
describe('torrentsFileterMiddleware', () => {

  it('Return true when blacklisted', async () => {
    expect(await isTorrentInBlacklist(infoHash)).toBe(true)
  })

  it('Middleware returns next when valid torrent', async () => {
    var next = {}
    var ret = await torrentFilterMiddleware({ params: { infoHash: 'non-blacklisted-infohash' }}, null, next)
    expect(ret).toBe(next)
  })

  it('Middleware throws when torrent blacklisted', async () => {
    expect(async () => await torrentFilterMiddleware({ params: { infoHash }}))
      .rejects.toEqual(new Error('Torrent is blacklisted'))
  })
})