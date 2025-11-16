export const ResourcesSymbol = Symbol("Resources");

export default function (app, resources = {}, options = null) {
  const globalResources =
    app.config.globalProperties.resources ||
    (app.config.globalProperties.resources = {});

  Object.keys(resources).forEach(resource => {
    globalResources[resource] = resources[resource];
  });

  if (options && options.resources) {
    Object.keys(options.resources).forEach((resource) => {
      globalResources[resource] = options.resources[resource];
    });
  }

  app.provide(ResourcesSymbol, globalResources);
}
