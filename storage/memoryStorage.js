const storage = new Map()

module.exports = () => ({
  setItem: (key, data) => storage.set(key, data),
  getItem: (key) => storage.get(key)
})
