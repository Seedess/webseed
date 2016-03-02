function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      escapeXml = __helpers.x;

  return function render(data, out) {
    out.w('<!doctype html> <html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>' +
      escapeXml(data.title) +
      '</title><link rel="stylesheet" href="/css/style.css">');

    if (out.global.locals.ENV_DEVELOPMENT) {
      out.w('<script src="http://localhost:35729/livereload.js"></script>');
    }

    out.w('</head><body></body></html>');
  };
}
(module.exports = require("marko").c(__filename)).c(create);