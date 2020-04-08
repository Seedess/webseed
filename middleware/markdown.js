const showdown = require('showdown')
const converter = new showdown.Converter()

module.exports = (req, res, next) => {
  res.markdown = markdown => {
    const html = `
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="css/github-markdown.css">
      <style>
        .markdown-body {
          box-sizing: border-box;
          min-width: 200px;
          max-width: 980px;
          margin: 0 auto;
          padding: 45px;
        }
      
        @media (max-width: 767px) {
          .markdown-body {
            padding: 15px;
          }
        }
      </style>
      <article class="markdown-body">
        ${converter.makeHtml(markdown)}
      </article>
    `
    res.send(html)
  }
  next()
}