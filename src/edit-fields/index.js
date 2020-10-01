export default function (Vue, options) {
  Vue.prototype.$editFields = options.editFields ? options.editFields : {};
}
