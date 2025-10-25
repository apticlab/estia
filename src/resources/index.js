export default function (app, resources, options = null) {
  app.config.globalProperties.resources = {}

  Object.keys(resources).forEach(resource => {
    app.config.globalProperties.resources[resource] = resources[resource]
  })
}
