export default function (app, options) {
  app.config.globalProperties.$viewFields = options.viewFields ? options.viewFields : {};
}
