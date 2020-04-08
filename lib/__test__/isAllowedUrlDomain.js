const assert = require('assert');
const isAllowedUrlDomain = require('../isAllowedUrlDomain')

describe('isAllowedUrlDomain', () => {

  it ('will not match different domain', async () => {
    const url = 'https://cdn.seedess.com/video.mp4'
    const test = isAllowedUrlDomain(url, ['foo', 'bar'])
    assert.ok(!test)
  })

  it ('will not match sub domain', async () => {
    const url = 'https://cdn.seedess.com/video.mp4'
    const test = isAllowedUrlDomain(url, ['foo', 'seedess.com'])
    assert.ok(!test)
  })

  it ('matches complete domain', async () => {
    const url = 'https://cdn.seedess.com/video.mp4'
    const test = isAllowedUrlDomain(url, ['foo', 'cdn.seedess.com'])
    assert.ok(test)
  })

  it ('matches sub domain pattern', async () => {
    const url = 'https://cdn.seedess.com/video.mp4'
    const test = isAllowedUrlDomain(url, ['foo', '*.seedess.com'])
    assert.ok(test)
  })

  it ('matches glob * pattern', async () => {
    const url = 'https://cdn.seedess.com/video.mp4'
    const test = isAllowedUrlDomain(url, ['foo', '*'])
    assert.ok(test)
  })

})