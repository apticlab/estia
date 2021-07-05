export default function (Vue, options) {
  Vue.prototype.$viewFields = options.viewFields ? options.viewFields : {};
}
