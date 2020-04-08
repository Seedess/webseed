const { createLocalStorage } = require("localstorage-ponyfill");
const localStorage = createLocalStorage({ mode: 'node', storeFilePath: '../.data/' })
const { serialize, unserialize } = require('./serializer')

module.exports = () => ({
  setItem: (key, data) => localStorage.setItem(key, serialize(data)),
  getItem: (key) => unserialize(localStorage.getItem(key))
})