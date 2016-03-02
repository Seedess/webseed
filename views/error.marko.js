function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      __components_app_header_template_marko = __helpers.l(require.resolve("./components/app-header/template.marko")),
      escapeXml = __helpers.x,
      __components_app_footer_template_marko = __helpers.l(require.resolve("./components/app-footer/template.marko"));

  return function render(data, out) {
    __components_app_header_template_marko.render({"title": data.title}, out);

    out.w(escapeXml(data.message) +
      escapeXml(data.error.status) +
      escapeXml(data.error.stack));

    __components_app_footer_template_marko.render({}, out);
  };
}
(module.exports = require("marko").c(__filename)).c(create);