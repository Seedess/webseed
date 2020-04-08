const assert = require('assert');
const localStorage = require('../localStorage')()

describe('localStorage', () => {


  it ('saves objects by value', async () => {
    const item = { id: 'foo' }
    await localStorage.setItem('foo', item)
    const savedItem = await localStorage.getItem('foo')
    assert.deepEqual(item, savedItem)
  })

})