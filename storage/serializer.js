module.exports = {
  serialize: data => JSON.stringify(data),
  unserialize: data => data ? JSON.parse(data) : data
}