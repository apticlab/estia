let testResources = {}

export default function (resources) {
  testResources = resources || {}

  return {
    list
  }
}

function list (resourceName, filter) {
  return new Promise(function (resolve, reject) {
    let resources = testResources[resourceName] || []
    resolve(resources)
  })
}
