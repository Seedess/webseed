const showdown = require('showdown')
const converter = new showdown.Converter()

module.exports = (req, res, next) => {
  res.markdown = markdown => {
    res.send(converter.makeHtml(markdown))
  }
  next()
}