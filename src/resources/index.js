export default function (Vue, resources, options = null) {
  Vue.prototype.resources = {}

  Object.keys(resources).forEach(resource => {
    Vue.prototype.resources[resource] = resources[resource]
  })
}
