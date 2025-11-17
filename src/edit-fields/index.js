export default function (app, options) {
  app.config.globalProperties.$editFields = options.editFields ? options.editFields : {};
}
