import axios from 'axios'
import { getToken, hasActiveRole, getActiveRole } from './auth.js'
import { EventBus } from './event-bus.js'
import testApi from './test-api.js'

// TODO: refactor const in a const file to import!
const HOST = process.env.API_HOST || ''
// const API_URL = HOST + "/api";
const BASE_URL = HOST + '/'

var API_URL = HOST + '/api'

console.log('Init api endpoint con ', API_URL)

function setInterceptorToken () {
  axios.interceptors.request.use(
    function (config) {
      var authToken = getToken()
      if (authToken == null) {
        // Send to login!
      } else {
        config.headers.common['Authorization'] = 'Bearer ' + authToken
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + authToken

        if (hasActiveRole()) {
          axios.defaults.headers.common['activerole'] = getActiveRole()
        } else {
          delete axios.defaults.headers.common['activerole']
        }
      }

      return config
    },
    function (error) {
      return Promise.reject(error)
    }
  )
}

setInterceptorToken()

const api = {
  act,
  list,
  params,
  get,
  image,
  imageUrl,
  create,
  update,
  delete: _delete,
  post,
  upload,
  download
}

export default function (options) {
  if (options.test && options.test.apiTest) {
    return testApi(options.test.resources)
  }

  return api
}

function list (resourceName, filter) {
  return new Promise(function (resolve, reject) {
    axios
      .get(API_URL + '/' + resourceName, {
        params: filter
      })
      .then(
        function (data) {
          resolve(data.data)
        },
        function (err) {
          reject(err)
        }
      )
  })
}

function params (paramsName) {
  return new Promise(function (resolve, reject) {
    axios.get(API_URL + '/params/' + paramsName).then(
      function (data) {
        resolve(data.data)
      },
      function (err) {
        reject(err)
      }
    )
  })
}

async function create (resourceName, resource) {
  let result = await axios.post(API_URL + '/' + resourceName, resource)

  return result
}

async function update (resourceName, resourceId, resource) {
  let result = await axios.put(API_URL + '/' + resourceName + '/' + resourceId, resource)

  return result
}

function get (resourceName, id, params = {}, isBlob = false) {
  return new Promise(function (resolve, reject) {
    let url = ''

    if (id !== undefined) {
      url = API_URL + '/' + resourceName + '/' + id
    } else {
      url = API_URL + '/' + resourceName
    }

    axios
      .get(url, {
        params: params,
        responseType: isBlob ? 'blob' : undefined
      })
      .then(
        function (data) {
          resolve(data.data)
        },
        function (err) {
          reject(err)
        }
      )
  })
}

function image (resourceName, id) {
  return new Promise(function (resolve, reject) {
    axios.get(API_URL + '/' + resourceName + '/' + id + '/').then(
      function (data) {
        resolve({
          mimeType: data.headers['content-type'],
          imageBlob: data.data
        })
      },
      function (err) {
        reject(err)
      }
    )
  })
}

function imageUrl (imageUrl) {
  return BASE_URL + imageUrl
}

function post (resourceName, params) {
  return new Promise(function (resolve, reject) {
    axios.post(API_URL + '/' + resourceName, params).then(
      function (data) {
        resolve(data.data)
      },
      function (err) {
        reject(err.response.data)
      }
    )
  })
}

function act (resourceName, resourceId, actionName, params) {
  return new Promise(function (resolve, reject) {
    axios.post(API_URL + '/' + resourceName + '/' + resourceId + '/act/' + actionName, params).then(
      function (data) {
        resolve(data.data)
      },
      function (err) {
        reject(err.response.data)
      }
    )
  })
}

function _delete (resourceName, id) {
  return new Promise(function (resolve, reject) {
    axios.delete(API_URL + '/' + resourceName + '/' + id).then(
      function (data) {
        resolve(data.data)
      },
      function (err) {
        reject(err)
      }
    )
  })
}

function upload (data, url) {
  return new Promise(function (resolve, reject) {
    var params = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }

    axios
      .post(API_URL + '/' + url, data, params)
      .then(function (result) {
        resolve(result.data)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

function download (url, filter) {
  return new Promise(function (resolve, reject) {
    var params = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'blob',
      params: filter
    }

    axios
      .get(API_URL + '/download/' + url, params)
      .then(function (data) {
        resolve({
          blob: data.data,
          fileName: data.headers['filename'],
          mime: data.headers['content-type']
        })
      })
      .catch(function (error) {
        reject(error)
      })
  })
}
