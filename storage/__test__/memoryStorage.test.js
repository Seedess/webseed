const assert = require('assert');
const memoryStorage = require('../memoryStorage')()

describe('memoryStorage', () => {


  it ('saves objects by reference', async () => {
    const item = { id: 'foo' }
    await memoryStorage.setItem('foo', item)
    const savedItem = await memoryStorage.getItem('foo')
    assert.strictEqual(item, savedItem)
  })

})