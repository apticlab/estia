import axios from 'axios'
import { getToken, hasActiveRole, getActiveRole, setProfile } from './auth.js'
import { EventBus } from './event-bus.js'
import testApi from './test-api.js'

var ENV = process.env.NODE_ENV || 'development';
var HOST = "";
var BASE_URL = "";
var API_URL = "";
var LOGIN_URL = "";

function setInterceptorToken() {
  axios.interceptors.request.use(
    function (config) {
      var authToken = getToken()
      if (authToken == null) {
        // Send to login!
      } else {
        config.headers = {
          'Authorization': 'Bearer ' + authToken
        }

        axios.defaults.headers = {
          'Authorization': 'Bearer ' + authToken
        }

        if (hasActiveRole()) {
          axios.defaults.headers['activerole'] = getActiveRole()
        } else {
          delete axios.defaults.headers['activerole']
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

export default function (options) {
  if (options.apiHost) {
    HOST = options.apiHost ? options.apiHost[ENV] : "";
  } else {
    if (process.env.VUE_APP_API_HOST) {
      HOST = process.env.VUE_APP_API_HOST;
    }
  }

  const api = {
    act,
    list,
    params,
    get,
    image,
    imageUrl,
    create,
    login,
    update,
    delete: _delete,
    post,
    upload,
    download
  }

  BASE_URL = HOST + '/';
  API_URL = HOST + '/api';
  LOGIN_URL = API_URL + "/login";

  if (options.test && options.test.apiTest) {
    return testApi(options.test.resources)
  }

  return api
}

async function login(username, password) {
  let loginFormData = new FormData();

  loginFormData.set("username", username);
  loginFormData.set("password", password);

  let response = {
    error: null,
    data: null
  };

  try {
    response.data = await axios.post(LOGIN_URL, loginFormData);
  } catch (e) {
    response.error = e.response.data;
    return response;
  }

  let data = response.data.data;

  if (!data.token) {
    data.detail = "missing_token";

    return {
      error: data
    };
  }

  localStorage.setItem("token", data.token);

  axios.defaults.headers["Authorization"] = "Bearer " + data.token;

  setProfile(data.user);

  return {
    user: data.user
  };
}

function list(resourceName, filter) {
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

function params(paramsName, params = {}) {
  return new Promise(function (resolve, reject) {
    axios.get(API_URL + '/params/' + paramsName, { params }).then(
      function (data) {
        resolve(data.data)
      },
      function (err) {
        reject(err)
      }
    )
  })
}

async function create(resourceName, resource) {
  let result = await axios.post(API_URL + '/' + resourceName, resource)

  return result
}

async function update(resourceName, resourceId, resource) {
  let result = await axios.put(API_URL + '/' + resourceName + '/' + resourceId, resource)

  return result
}

function get(resourceName, id, params = {}, isBlob = false) {
  console.log('get', resourceName, id, params, isBlob);
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

function image(resourceName, id) {
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

function imageUrl(imageUrl) {
  return BASE_URL + imageUrl
}

function post(resourceName, params) {
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

function act(resourceName, resourceId, actionName, params, config) {
  return new Promise(function (resolve, reject) {
    let url = API_URL + '/' + resourceName + '/' + resourceId + '/act/' + actionName;

    axios.post(url, params, config).then(
      function (data) {
        resolve(data.data)
      },
      function (err) {
        reject(err.response.data)
      }
    )
  })
}

function _delete(resourceName, id) {
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

function upload(data, url) {
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

function download(url, filter) {
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