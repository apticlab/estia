import VueFormulate from '@braid/vue-formulate';
import VueSVGIcon from 'vue-svgicon';
import VueTailwind from 'vue-tailwind';
import TPagination from 'vue-tailwind/dist/t-pagination';
import moment from 'moment';
import _$1, { isObject } from 'lodash';
import Vue from 'vue';
import axios from 'axios';
import { mapState, mapActions, mapGetters } from 'vuex';
import VCalendar from 'v-calendar';
import VueWindowSize from 'vue-window-size';
import { VLazyImagePlugin } from 'v-lazy-image';
import VueI18n from 'vue-i18n';
import DateRangePicker from 'vue2-daterange-picker';
import Chart from 'chart.js';
import Popper from 'popper.js';
import VueTimepicker from 'vue2-timepicker';
import PrismEditor from 'vue-prism-editor';
import 'prismjs';
import 'prismjs/themes/prism.css';
import CodiceFiscale from 'codice-fiscale-js';
import { checkVAT, italy } from 'jsvat';

moment.locale('it');

var helpers = {
  getNestedField: getNestedField,
  getInfoFromOptions: getInfoFromOptions,
  clone: clone,
  sleep: sleep,
  deepFind: deepFind,
  getColor: getColor,
  createRandomArray: createRandomArray,
  evaluateCondition: evaluateCondition,
  dateFromConditionValue: dateFromConditionValue,
  deepPick: deepPick,
  moment: moment,
  getDayWeekNumber: getDayWeekNumber,
  getVisibleItemsByRole: getVisibleItemsByRole,
  itemIsVisible: itemIsVisible
};

function getDayWeekNumber (_date) {
  return this.moment(_date).day()
}

function clone (value) {
  return JSON.parse(JSON.stringify(value))
}

function getNestedField (resource, field) {
  if (!field) {
    return ''
  }

  var fields = field.split('.');

  for (var i = 0; i < fields.length; i++) {
    if (resource != null) {
      resource = resource[fields[i]];
    }
  }

  return resource
}

function getInfoFromOptions (resource, header, infoType) {
  var tagId = getNestedField(resource, header.value);
  var tagField = 'name';
  var currentTag = {};

  if (
    header.option &&
    header.option.options &&
    !header.option.options.resource
  ) {
    tagField =
      (header.option.text ? header.option.text : header.field_name) || 'name';
    var optionList = header.option.options.list || [];

    currentTag = optionList.find(function (e) { return e.id == tagId; });
  } else {
    currentTag = tagId;
  }

  switch (infoType) {
    case 'color':
      return currentTag ? currentTag.color : '#888'

    case 'text':
      return currentTag ? currentTag[tagField] : ''
  }
}

function sleep (ms) {
  return new Promise(function (resolve) { return setTimeout(resolve, ms); })
}

function deepFind (obj, path) {
  var paths = path.split('.');
  var current = obj;
  var i;

  if (!current) {
    return ''
  }

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return undefined
    } else {
      current = current[paths[i]];
    }
  }

  return current
}

function getColor (colorString) {
  if (!Array.isArray(colorString)) {
    colorString = colorString || 'gray-400';
    var elem = document.querySelector('.color-swatch.bg-' + colorString);
    return elem != null ? getComputedStyle(elem).backgroundColor : ''
  }

  return colorString.map(function (color) {
    color = color || 'gray-400';
    var elem = document.querySelector('.color-swatch.bg-' + color);
    return elem != null ? getComputedStyle(elem).backgroundColor : ''
  })
}

function createRandomArray (min, max, number) {
  var array = [];

  for (var i = 0; i < number; i++) {
    array.push(Math.round(Math.random() * max) + min);
  }

  return array
}

function deepPick (object, nestedField) {
  if (nestedField == '.') {
    return object
  }

  return _$1.get(object, nestedField)
}

/*
function evaluateCondition(condition, object, reference = null) {
  const conditionValueDefaults = {
    NULL: null,
    UNDEFINED: undefined,
    FALSE: false,
    TRUE: true
  };

  // condition: [<field>, <operator>, <value>]
  let conditionIsMet = false;
  let conditionFieldValue = this.deepPick(object, condition[0]);
  let conditionOperator = condition[1];
  let conditionValue = condition[2];

  if (conditionValue in conditionValueDefaults) {
    conditionValue = conditionValueDefaults[conditionValue];
  }

  if (condition[2]) {
    if (condition[2][0] == "$") {
      // Pick the value from the object not from the actual string value
      let conditionValueField = condition[2].substring(1);
      conditionValue = this.deepPick(reference, conditionValueField);
    }
  }

  switch (conditionOperator) {
    case "=":
      conditionIsMet = conditionFieldValue == conditionValue;
      break;
    case "!=":
      // !!conditionFieldValue is for ensuring conditionFieldValue is not null or undefined
      conditionIsMet = conditionFieldValue != conditionValue;
      break;
    case "IN":
      var conditionValueTokens = [];

      // Use both string separated arrays and normal js arrays
      if (Array.isArray(conditionValue)) {
        conditionValueTokens = conditionValue;
      } else {
        if (typeof conditionValue && conditionValue.indexOf(",") != -1) {
          conditionValueTokens = conditionValue.split(",");
        }
      }

      conditionIsMet =
        !!conditionFieldValue &&
        conditionValueTokens.indexOf("" + conditionFieldValue) > -1;
      break;
    case "NOT IN":
      var conditionValueTokens = [];

      // Use both string separated arrays and normal js arrays
      if (Array.isArray(conditionValue)) {
        conditionValueTokens = conditionValue;
      } else {
        if (typeof conditionValue && conditionValue.indexOf(",") != -1) {
          conditionValueTokens = conditionValue.split(",");
        }
      }

      conditionIsMet =
        !!conditionFieldValue &&
        !conditionValueTokens.includes("" + conditionFieldValue);
      break;
    case "NULL":
      conditionIsMet =
        conditionFieldValue == null || conditionFieldValue == undefined;
      break;
  }

  return conditionIsMet;
}
*/

function evaluateCondition (condition, object, reference) {
  if ( reference === void 0 ) reference = null;

  var conditionValueDefaults = {
    NULL: null,
    UNDEFINED: undefined,
    FALSE: false,
    TRUE: true
  };

  var conditionIsMet = true;

  if (!condition) {
    return false
  }

  // se è un oggetto contente il campo operator and condition verifico il valore del campo `operator` e di `condition`
  if (condition.operator && condition.condition) {
    var conditions = condition.condition;

    conditionIsMet = false;
    for (var i = 0; i < conditions.length; i++) {
      var _condition = conditions[i];

      switch (condition.operator) {
        case 'OR':
          // console.log('sto facendo un OR');
          conditionIsMet = conditionIsMet || evaluateCondition(_condition, object, reference);
          // console.log('risulta', conditionIsMet);
          break
        case 'AND':
          // console.log('AND');
          conditionIsMet = conditionIsMet && evaluateCondition(_condition, object, reference);
      }
    }

    return conditionIsMet
  }

  // se il primo campo è un array allora sono altre condizioni da valutare separatamente
  if (_$1.isArray(condition[0])) {
    var conditions$1 = condition;

    for (var i$1 = 0; i$1 < conditions$1.length; i$1++) {
      var condition$1 = conditions$1[i$1];
      conditionIsMet =
        conditionIsMet && evaluateCondition(condition$1, object, reference);
    }

    return conditionIsMet
  }

  // condition: [<field>, <operator>, <value>]
  var conditionFieldValue = deepPick(object, condition[0]);
  var conditionOperator = condition[1];
  var conditionValue = condition[2];

  if (conditionValue in conditionValueDefaults) {
    conditionValue = conditionValueDefaults[conditionValue];
  }

  if (condition[2]) {
    if (condition[2][0] == '$') {
      // Pick the value from the object not from the actual string value
      var conditionValueField = condition[2].substring(1);
      conditionValue = deepPick(reference, conditionValueField);
    }
  }

  if (_$1.isFunction(conditionOperator)) {
    conditionIsMet = conditionOperator(conditionFieldValue, conditionValue);
  } else {
    switch (conditionOperator) {
      case '>':
        conditionIsMet = Number(conditionFieldValue) > Number(conditionValue);
        break
      case '<':
        conditionIsMet = Number(conditionFieldValue) < Number(conditionValue);
        break
      case '>=':
        conditionIsMet = Number(conditionFieldValue) >= Number(conditionValue);
        break
      case '<=':
        conditionIsMet = Number(conditionFieldValue) <= Number(conditionValue);
        break
      case '=':
        conditionIsMet = conditionFieldValue == conditionValue;
        break
      case '!=':
        // !!conditionFieldValue is for ensuring conditionFieldValue is not null or undefined
        conditionIsMet =
          !!conditionFieldValue && conditionFieldValue != conditionValue;
        console.log('conditionIsMet', conditionIsMet);
        break
      case 'IN':
        var conditionValueTokens = [];

        // Use both string separated arrays and normal js arrays
        if (Array.isArray(conditionValue)) {
          conditionValueTokens = conditionValue;
        } else {
          if (typeof conditionValue && conditionValue.indexOf(',') != -1) {
            conditionValueTokens = conditionValue.split(',');
          }
        }

        conditionIsMet =
          !!conditionFieldValue &&
          conditionValueTokens.indexOf('' + conditionFieldValue) > -1;
        break
      case 'NOT IN':
        var conditionValueTokens = [];

        // Use both string separated arrays and normal js arrays
        if (Array.isArray(conditionValue)) {
          conditionValueTokens = conditionValue;
        } else {
          if (typeof conditionValue && conditionValue.indexOf(',') != -1) {
            conditionValueTokens = conditionValue.split(',');
          }
        }

        conditionIsMet =
          !!conditionFieldValue &&
          !conditionValueTokens.includes('' + conditionFieldValue);
        break
      case 'NULL':
        conditionIsMet =
          conditionFieldValue == null || conditionFieldValue == undefined;
        break
      case 'AFTER':
        conditionValue = dateFromConditionValue(conditionValue);
        conditionIsMet = conditionFieldValue ? moment(conditionFieldValue).isAfter(conditionValue) : true;
        break
      case 'BEFORE':
        conditionValue = dateFromConditionValue(conditionValue);
        conditionIsMet = conditionFieldValue ? moment(conditionFieldValue).isBefore(conditionValue) : true;
        break
      case 'AFTER_OR_EQUAL':
        conditionValue = dateFromConditionValue(conditionValue);
        conditionIsMet = conditionFieldValue ? moment(conditionFieldValue).isSameOrAfter(
          conditionValue
        ) : true;
        break
      case 'BEFORE_OR_EQUAL':
        conditionValue = dateFromConditionValue(conditionValue);
        conditionIsMet = conditionFieldValue ? moment(conditionFieldValue).isSameOrBefore(
          conditionValue
        ) : true;
        break
      case 'LIKE':
        return !!String(conditionFieldValue).match(new RegExp(conditionValue))
    }
  }

  // console.log(conditionFieldValue, conditionOperator, conditionValue, conditionIsMet);
  return conditionIsMet
}

function dateFromConditionValue (dateString) {
  var date = null;

  switch (dateString) {
    case 'TODAY':
      date = moment().startOf('day');
      break
    case 'YESTERDAY':
      date = moment().add(-1, 'days').startOf('day');
      break
    case 'TOMORROW':
      date = moment().add(1, 'days').startOf('day');
      break
    default:
      if (dateString) {
        date = moment(dateString);
      }
  }

  return date
}

function getVisibleItemsByRole (items, user) {
  return items.filter(function (item) {
    return !item.roles || item.roles.includes(user.role.code)
  })
}

function itemIsVisible (item, reference, other) {
  var this$1 = this;
  if ( other === void 0 ) other = null;

  if (!item.visible || !Array.isArray(item.visible)) {
    return true
  }

  var isVisible = true;

  item.visible.forEach(function (condition) {
    isVisible =
      isVisible && this$1.evaluateCondition(condition, reference, other);
  });

  return isVisible
}

var EventBus = new Vue();

var HOST = process.env.VUE_APP_API_HOST  || "";

var API_URL = HOST + "/api";
var LOGIN_URL = API_URL + "/login";

function hasActiveRole() {
  return localStorage.getItem("activeRole") != null;
}

function getActiveRole() {
  if (hasActiveRole()) {
    return JSON.parse(localStorage.getItem("activeRole")).code;
  }

  return null;
}

function getToken() {
  return isLoggedIn() ? localStorage.getItem("token") : null;
}

function isLoggedIn() {
  // localStorage item is null when it's equal to 'null' (string null)
  return localStorage.getItem("token") != "null";
}

function getProfile() {
  var user = JSON.parse(localStorage.getItem("user"));

  if (user == null || user == undefined || user == {} || user == []) {
    return null;
  }

  return user;
}

function setProfile(user) {
  localStorage.setItem("user", JSON.stringify(user));
  EventBus.$emit("reload-user");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("activeRole");

  axios.defaults.headers.common["Authorization"] = null;
  delete axios.defaults.headers.common["activerole"];
}


function resetPassword(email) {
  return new Promise(function(resolve, reject) {
    axios
      .post(LOGIN_URL + "/resetpassword", {
        email: email
      })
      .then(
        function(response) {
          resolve(response.data);
        },
        function(err) {
          reject(err.response.data);
        }
      );
  });
}

var testResources = {};

function testApi (resources) {
  testResources = resources || {};

  return {
    list: list
  }
}

function list (resourceName, filter) {
  return new Promise(function (resolve, reject) {
    var resources = testResources[resourceName] || [];
    resolve(resources);
  })
}

var ENV = process.env.NODE_ENV == "development" ? "development" : "production";
var HOST$1 = "";
var BASE_URL = "";
var API_URL$1 = "";
var LOGIN_URL$1 = "";

function setInterceptorToken () {
  axios.interceptors.request.use(
    function (config) {
      var authToken = getToken();
      if (authToken == null) ; else {
        config.headers.common['Authorization'] = 'Bearer ' + authToken;
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + authToken;

        if (hasActiveRole()) {
          axios.defaults.headers.common['activerole'] = getActiveRole();
        } else {
          delete axios.defaults.headers.common['activerole'];
        }
      }

      return config
    },
    function (error) {
      return Promise.reject(error)
    }
  );
}

setInterceptorToken();

function api (options) {
  console.log(ENV);
  console.log(options);
  console.log(process.env);

  if (options.apiHost) {
    console.log("From apiHost");
    HOST$1 = options.apiHost ? options.apiHost[ENV] : "";
  } else {
    console.log("From Process.env");
    if (process.env.VUE_APP_API_HOST) {
      HOST$1 = process.env.VUE_APP_API_HOST;
    }
  }

  var api = {
    act: act,
    list: list$1,
    params: params,
    get: get,
    image: image,
    imageUrl: imageUrl,
    create: create,
    login: login,
    update: update,
    delete: _delete,
    post: post,
    upload: upload,
    download: download
  };

  BASE_URL = HOST$1 + '/';
  API_URL$1 = HOST$1 + '/api';
  LOGIN_URL$1 = API_URL$1 + "/login";

  console.log('api url', HOST$1);

  if (options.test && options.test.apiTest) {
    return testApi(options.test.resources)
  }

  return api
}

async function login(username, password) {
  var loginFormData = new FormData();

  loginFormData.set("username", username);
  loginFormData.set("password", password);

  var response = {
    error: null,
    data: null
  };

  try {
    response.data = await axios.post(LOGIN_URL$1, loginFormData);
  } catch (e) {
    response.error = e.response.data;
    return response;
  }

  var data = response.data.data;

  if (!data.token) {
    data.detail = "missing_token";

    return {
      error: data
    };
  }

  localStorage.setItem("token", data.token);

  axios.defaults.headers.common["Authorization"] =
    "Bearer " + data.token;

  setProfile(data.user);

  return {
    user: data.user
  };
}

function list$1 (resourceName, filter) {
  return new Promise(function (resolve, reject) {
    axios
      .get(API_URL$1 + '/' + resourceName, {
        params: filter
      })
      .then(
        function (data) {
          resolve(data.data);
        },
        function (err) {
          reject(err);
        }
      );
  })
}

function params (paramsName) {
  return new Promise(function (resolve, reject) {
    axios.get(API_URL$1 + '/params/' + paramsName).then(
      function (data) {
        resolve(data.data);
      },
      function (err) {
        reject(err);
      }
    );
  })
}

async function create (resourceName, resource) {
  var result = await axios.post(API_URL$1 + '/' + resourceName, resource);

  return result
}

async function update (resourceName, resourceId, resource) {
  var result = await axios.put(API_URL$1 + '/' + resourceName + '/' + resourceId, resource);

  return result
}

function get (resourceName, id, params, isBlob) {
  if ( params === void 0 ) params = {};
  if ( isBlob === void 0 ) isBlob = false;

  return new Promise(function (resolve, reject) {
    var url = '';

    if (id !== undefined) {
      url = API_URL$1 + '/' + resourceName + '/' + id;
    } else {
      url = API_URL$1 + '/' + resourceName;
    }

    axios
      .get(url, {
        params: params,
        responseType: isBlob ? 'blob' : undefined
      })
      .then(
        function (data) {
          resolve(data.data);
        },
        function (err) {
          reject(err);
        }
      );
  })
}

function image (resourceName, id) {
  return new Promise(function (resolve, reject) {
    axios.get(API_URL$1 + '/' + resourceName + '/' + id + '/').then(
      function (data) {
        resolve({
          mimeType: data.headers['content-type'],
          imageBlob: data.data
        });
      },
      function (err) {
        reject(err);
      }
    );
  })
}

function imageUrl (imageUrl) {
  return BASE_URL + imageUrl
}

function post (resourceName, params) {
  return new Promise(function (resolve, reject) {
    axios.post(API_URL$1 + '/' + resourceName, params).then(
      function (data) {
        resolve(data.data);
      },
      function (err) {
        reject(err.response.data);
      }
    );
  })
}

function act (resourceName, resourceId, actionName, params) {
  return new Promise(function (resolve, reject) {
    axios.post(API_URL$1 + '/' + resourceName + '/' + resourceId + '/act/' + actionName, params).then(
      function (data) {
        resolve(data.data);
      },
      function (err) {
        reject(err.response.data);
      }
    );
  })
}

function _delete (resourceName, id) {
  return new Promise(function (resolve, reject) {
    axios.delete(API_URL$1 + '/' + resourceName + '/' + id).then(
      function (data) {
        resolve(data.data);
      },
      function (err) {
        reject(err);
      }
    );
  })
}

function upload (data, url) {
  return new Promise(function (resolve, reject) {
    var params = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    axios
      .post(API_URL$1 + '/' + url, data, params)
      .then(function (result) {
        resolve(result.data);
      })
      .catch(function (error) {
        reject(error);
      });
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
    };

    axios
      .get(API_URL$1 + '/download/' + url, params)
      .then(function (data) {
        resolve({
          blob: data.data,
          fileName: data.headers['filename'],
          mime: data.headers['content-type']
        });
      })
      .catch(function (error) {
        reject(error);
      });
  })
}

var defaultTheme = {
  separatorClass: "text-gray-700 text-xl font-bold",
  labelClass: "text-gray-700 font-bold",
  inputClass: "rounded border border-gray-200 px-3 py-2",
  fieldClass: "text-gray-700 font-bold flex flex-col",
  backButtonClass: "bg-gray-300 text-gray-700",
  saveButtonClass: "bg-green-700 text-white",
  backdropBgColor: "bg-gray-700",
  loginCardClass: 'px-10 py-10 rounded-md flex flex-col flex-grow-0 bg-white overflow-hidden mt-2 max-w-screen-sm border border-gray-200',
  tab_view: {
    container: "",
    tab_container:
      "flex flex-row justify-between sm:justify-start mx-auto px-0 sm:px-4 sm:max-w-screen-sm md:max-w-screen-md xl:max-w-screen-xl",
    active: "text-gray-800 border-b-2 border-gray-800",
    inactive: "",
    normal: "mr-8 py-3 text-lg font-bold text-gray-light cursor-pointer",
  },
  paginationClasses: {
    wrapper: "flex",
    element: "w-8 h-8 mx-1",
    disabledElement: "w-8 h-8 mx-1",
    ellipsisElement: "w-8 h-8 mx-1",
    activeButton: "bg-blue-500 w-full h-full text-white rounded-full ",
    disabledButton:
    "opacity-25 w-full h-full cursor-not-allowed rounded-full",
    button: "hover:bg-blue-100 w-full h-full text-blue-500 rounded-full ",
    ellipsis: "text-gray-500"
  }
};

function theme (options) {
  return Object.assign({}, defaultTheme,
    options.theme);
}

var Logger = {
  data: function data() {
    return {};
  },
  mounted: function mounted() { },
  methods: {
    log: function log() {
      var logs = [], len = arguments.length;
      while ( len-- ) logs[ len ] = arguments[ len ];

      if (process.env.NODE_ENV != 'production') {
        console.log.apply(console, [ ("[" + (this.$options.name) + "]") ].concat( logs ));
      }
    },
  },
  computed: {},
};

var Mobile = {
  data: function data() {
    return {};
  },
  mounted: function mounted() {},
  methods: {},
  computed: {
    is_mobile: function is_mobile() {
      return this.windowWidth < 640;
    },
  },
};

var SideNavMixin = {
  data: function data () {
    return {
      is_collapsed: false,
      show_text: true
    }
  },
  created: function created () {},
  beforeMount: function beforeMount () {
    this.getSideBarCollapseState();
  },
  methods: {
    getSideBarCollapseState: function getSideBarCollapseState () {
      if (localStorage.getItem('is_collapsed')) {
        this.is_collapsed = !!JSON.parse(localStorage.getItem('is_collapsed'));
      } else {
        if (this.is_mobile) {
          this.is_collapsed = true;
        }
      }

      if (!this.is_collapsed) { return 0 }
      this.show_text = false;
    },
    collapseSideBar: function collapseSideBar () {
      var this$1 = this;

      var expanding = this.is_collapsed;
      if (expanding) {
        this.log('show-text', this.is_mobile);

        if (this.is_mobile) {
          this.show_text = !this.show_text;
          this.EventBus.$emit('side-bar:show-text', this.show_text);
        } else {
          // in modalità desktop il tempo del timeout deve essere
          // minore di 100ms rispetto alla durata dell'animazione
          setTimeout(function () {
            this$1.show_text = !this$1.show_text;
            this$1.EventBus.$emit('side-bar:show-text', this$1.show_text);
          }, 200);
        }
      } else {
        this.show_text = !this.show_text;
        this.EventBus.$emit('side-bar:show-text', this.show_text);
      }

      this.is_collapsed = !this.is_collapsed;
      localStorage.setItem('is_collapsed', this.is_collapsed);
      this.EventBus.$emit('side-bar:collapse', this.is_collapsed);
    },
    listenForSideNavCollapseEvent: function listenForSideNavCollapseEvent () {
      var this$1 = this;

      this.EventBus.$on('side-bar:collapse', function (value) {
        this$1.is_collapsed = value;
      });
      this.EventBus.$on('side-bar:show-text', function (value) {
        this$1.show_text = value;
      });
    },
    routeSectionTitle: function routeSectionTitle () {
      var labels = this.$route.matched
        .map(function (route) { return (route.meta ? route.meta.label : null); })
        .reverse();

      // Return the first not null && not undefined label
      return labels.find(function (label) { return !!label; })
    }
  }
};

var ActionsMixin = {
  data: function data () {
    return {}
  },
  mounted: function mounted () {},
  methods: {
    actOnRow: function actOnRow (event) {
      var action = event.action;
      var index = event.index;

      if (this[action.callback]) {
        var row = this.rows[index];
        this[action.callback](row);
      }

      if (this.$actions[action.callback]) {
        var row$1 = this.rows[index];
        this.$actions[action.callback](this, row$1);
      }
    },
    act: function act (action, data) {
      if ( data === void 0 ) data = null;

      if (this[action.callback]) {
        this[action.callback](data);
      }

      if (this.$actions[action.callback]) {
        this.$actions[action.callback](this, data);
      }
    },
    isActionVisible: function isActionVisible (action, row) {
      if (!action.visible) {
        return true
      }

      return this.itemIsVisible(action, row, this)
    }
  },
  computed: {
    visibleActions: function visibleActions () {
      var this$1 = this;

      var actions = this.actions.filter(function (action) {
        if (action.multi) {
          return false
        }

        var actionScope = this$1.actionScope || 'list';

        var roleBasedFilter = !action.roles || action.roles.includes(this$1.getUserRole());
        var scopeBasedFilter = !action.scopes || action.scopes.includes(actionScope);
        var visibilityFilter = this$1.itemIsVisible(action, this$1);

        return roleBasedFilter && scopeBasedFilter && visibilityFilter
      });

      return actions
    },
    scopedActions: function scopedActions () {
      var this$1 = this;

      var actions = this.actions.filter(function (action) {
        if (action.multi) {
          return false
        }

        var actionScope = this$1.actionScope || 'list';

        var roleBasedFilter = !action.roles || action.roles.includes(this$1.getUserRole());
        var scopeBasedFilter = !action.scopes || action.scopes.includes(actionScope);

        return roleBasedFilter && scopeBasedFilter
      });

      return actions
    },
    multiActions: function multiActions () {
      var this$1 = this;

      return this.actions.filter(function (action) {
        var roleBasedFilter = !action.roles || action.roles.includes(this$1.getUserRole());

        return action.multi && roleBasedFilter
      })
    }
  }
};

var CurrentUser = {
  computed: Object.assign({}, mapState("user", {
      user: function (state) { return state.user; }
    })),
  methods: {
    getUserRole: function getUserRole() {
      if (this.$roleLookup) {
        return this.$roleLookup(this.user);
      }

      // Default roleLookup
      return this.user.role.code.toLowerCase();
    }
  }
};

function mixins(Vue) {
  Vue.mixin(Logger);
  Vue.mixin(Mobile);
  Vue.mixin(SideNavMixin);
  Vue.mixin(ActionsMixin);
  Vue.mixin(CurrentUser);
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script = {
  props: {
    params: { required: true, default: {} }
  },
  data: function data () {
    return {
      state: 'idle',
      newPassword: '',
      cancelText: 'Annulla'
    }
  },
  computed: {
    confirmText: function confirmText () {
      var confirmText = '';

      switch (this.state) {
        case 'idle':
          confirmText = 'Cambia';
          break
        case 'loading':
          confirmText = 'Cambiando...';
          break
        case 'passwordChanged':
          confirmText = 'Chiudi';
          break
      }

      return confirmText
    },
    btnDisabled: function btnDisabled () {
      switch (this.state) {
        case 'idle':
          return this.newPassword == ''
        case 'loading':
          return true
        case 'passwordChanged':
          return false
      }
    }
  },
  mounted: function mounted () {},
  methods: {
    confirm: function confirm (result) {
      this.$emit('done', { result: result });
    },
    handleChangePassword: function handleChangePassword () {
      switch (this.state) {
        case 'idle':
          this.state = 'loading';
          this.changePassword();
          break
        case 'passwordChanged':
          this.confirm(true);
          break
      }
    },
    changePassword: async function changePassword () {
      var result = await this.$api.act(
        'users',
        this.params.user_id,
        'change_password',
        {
          new_password: this.newPassword
        }
      );

      this.state = 'passwordChanged';
    }
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    var options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "md:w-172 w-full bg-white shadow-2xl flex flex-col" },
    [
      _c("div", { staticClass: "h-2 bg-indigo-700" }),
      _vm._v(" "),
      _c("div", { staticClass: "p-4" }, [
        _c("div", { staticClass: "flex flex-row items-baseline" }, [
          _vm._m(0),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "flex flex-col ml-4 mr-4 min-h-64 flex-grow" },
            [
              _c("h2", { staticClass: "m-0 mb-4 font-medium text-2xl" }, [
                _vm._v("\n          Cambio Password\n        ")
              ]),
              _vm._v(" "),
              _vm.state == "idle"
                ? _c("div", { staticClass: "flex flex-col flex-grow" }, [
                    _c("p", [
                      _vm._v(
                        "\n            Per cambiare la password è sufficiente inserire il nuovo valore\n            nella casella di testo e premere 'Cambia', quindi attendere la\n            fine della procedura e comunicare all'utente la nuova password\",\n          "
                      )
                    ]),
                    _vm._v(" "),
                    _c(
                      "label",
                      {
                        staticClass: "text-gray-500 text-xs mb-1 mt-3",
                        attrs: { for: "new-password" }
                      },
                      [_vm._v("\n            Nuova password\n          ")]
                    ),
                    _vm._v(" "),
                    _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.newPassword,
                          expression: "newPassword"
                        }
                      ],
                      staticClass:
                        "rounded bg-indigo-100 text-base text-gray-600 px-3 py-3 outline-none border-1 border-indigo-200",
                      attrs: { id: "new-password", type: "text" },
                      domProps: { value: _vm.newPassword },
                      on: {
                        input: function($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.newPassword = $event.target.value;
                        }
                      }
                    })
                  ])
                : _vm._e(),
              _vm._v(" "),
              _vm.state == "loading"
                ? _c(
                    "div",
                    {
                      staticClass: "flex-grow flex flex-col items-center mr-16"
                    },
                    [
                      _c(
                        "div",
                        {
                          staticClass:
                            "flex flex-col items-center justify-center"
                        },
                        [
                          _c("loading", {
                            staticClass: "mb-4",
                            staticStyle: { height: "60px" }
                          }),
                          _vm._v(" "),
                          _c("span", { staticClass: "text-xl text-gray-500" }, [
                            _vm._v("\n              Caricamento\n            ")
                          ])
                        ],
                        1
                      )
                    ]
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.state == "passwordChanged"
                ? _c(
                    "div",
                    {
                      staticClass: "flex-grow flex flex-col items-center mr-16"
                    },
                    [
                      _c("span", { staticClass: "text-base" }, [
                        _vm._v("Nuova password da comunicare:")
                      ]),
                      _vm._v(" "),
                      _c(
                        "span",
                        {
                          staticClass:
                            "font-medium text-indigo-700 text-2xl mt-3"
                        },
                        [
                          _vm._v(
                            "\n            " +
                              _vm._s(_vm.newPassword) +
                              "\n          "
                          )
                        ]
                      )
                    ]
                  )
                : _vm._e()
            ]
          )
        ])
      ]),
      _vm._v(" "),
      _c(
        "div",
        {
          staticClass:
            "py-3 px-4 bg-gray-100 border-gray-200 border-t-1 flex flex-row items-center"
        },
        [
          _c(
            "button",
            {
              staticClass: "text-gray-700 px-3 py-2 mr-3 ml-auto outline-none",
              on: {
                click: function($event) {
                  return _vm.confirm(false)
                }
              }
            },
            [_vm._v("\n      " + _vm._s(_vm.cancelText) + "\n    ")]
          ),
          _vm._v(" "),
          _c(
            "button",
            {
              staticClass:
                "rounded bg-indigo-200 text-indigo-700 font-medium px-3 py-2 outline-none",
              class: {
                disabled: _vm.btnDisabled
              },
              on: {
                click: function($event) {
                  return _vm.handleChangePassword()
                }
              }
            },
            [_vm._v("\n      " + _vm._s(_vm.confirmText) + "\n    ")]
          )
        ]
      )
    ]
  )
};
var __vue_staticRenderFns__ = [
  function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "div",
      {
        staticClass:
          "min-w-10 min-h-10 rounded-full bg-indigo-200 flex flex-row items-center justify-center"
      },
      [_c("i", { staticClass: "hi-lock-open tx-indigo-700 text-2xl" })]
    )
  }
];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$1 = {
  name: "DialogModal",
  components: {
    "change-password": __vue_component__,
  },
  data: function data() {
    return {
      // variable that shows/hides modal
      visible: false,
      type: "",
      params: {},
      defaultCancelText: "Annulla",
      defaultConfirmText: "Conferma",
      onConfirm: {},
      theme: {},
    };
  },
  computed: {
    themeTitle: function themeTitle() {
      return this.theme.title || this.$theme.modal.title;
    },
  },
  beforeMount: function beforeMount() {
    Dialog.EventBus.$on("show", this.show);
  },
  beforeDestroy: function beforeDestroy() {
    Dialog.EventBus.$off("show", this.show);
  },
  methods: {
    hide: function hide() {
      // method for closing modal
      this.log("hide");
      this.visible = false;
    },
    confirm: function confirm(result) {
      this.log("confirm");
      this.hide();
      this.onConfirm(result);
    },
    show: function show(params) {
      this.params = params;
      this.type = params.type;
      this.onConfirm = params.onConfirm;
      this.theme = params.theme;

      // making modal visible
      this.visible = true;
    },
    handleBackdropClick: function handleBackdropClick(event) {
      if (this.params.disableBackdropHide) {
        return;
      }

      if (this.$refs.backdrop == event.target) {
        this.hide();
      }
    },
  },
};

var isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return function (id, style) { return addStyle(id, style); };
}
var HEAD;
var styles = {};
function addStyle(id, css) {
    var group = isOldIE ? css.media || 'default' : id;
    var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                { style.element.setAttribute('media', css.media); }
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            var index = style.ids.size - 1;
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index])
                { style.element.removeChild(nodes[index]); }
            if (nodes.length)
                { style.element.insertBefore(textNode, nodes[index]); }
            else
                { style.element.appendChild(textNode); }
        }
    }
}

/* script */
var __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("transition", { attrs: { name: "fade" } }, [
    _vm.visible
      ? _c("div", { staticClass: "fixed inset-0 z-50" }, [
          _c("div", {
            staticClass: "absolute inset-0 opacity-50 bg-gray-dark",
            class: _vm.$theme.backdropBgColor,
            on: {
              click: function($event) {
                return _vm.hide()
              }
            }
          }),
          _vm._v(" "),
          _c(
            "div",
            {
              ref: "backdrop",
              staticClass:
                "absolute inset-0 flex flex-col items-center justify-center",
              on: {
                click: function($event) {
                  return _vm.handleBackdropClick($event)
                }
              }
            },
            [
              _vm.type == "change_password"
                ? _c(
                    "div",
                    [
                      _c("change-password", {
                        attrs: { params: _vm.params },
                        on: { done: _vm.confirm }
                      })
                    ],
                    1
                  )
                : _vm.type == "checkin"
                ? [
                    _c("check-in-modal", {
                      class: _vm.is_mobile ? "h-full w-full" : "",
                      attrs: { params: _vm.params },
                      on: { done: _vm.confirm }
                    })
                  ]
                : _vm.type == "checkout"
                ? [
                    _c("check-in-modal", {
                      class: _vm.is_mobile ? "h-full w-full" : "",
                      attrs: { params: _vm.params },
                      on: { done: _vm.confirm }
                    })
                  ]
                : _vm.type == "import-csv"
                ? [
                    _c("import-csv-modal", {
                      attrs: { params: _vm.params },
                      on: { done: _vm.confirm }
                    })
                  ]
                : _vm.$modalWidgets[_vm.type]
                ? [
                    _c(_vm.$modalWidgets[_vm.type], {
                      tag: "component",
                      attrs: { params: _vm.params },
                      on: { done: _vm.confirm }
                    })
                  ]
                : [
                    _c(
                      "div",
                      {
                        staticClass:
                          "\n            flex flex-col\n            p-5\n            bg-white\n            rounded-none\n            shadow-2xl\n            sm:rounded-lg\n          ",
                        class: _vm.is_mobile ? "h-full w-full" : ""
                      },
                      [
                        _c("div", { staticClass: "flex-grow p-4" }, [
                          _c(
                            "div",
                            {
                              staticClass: "flex flex-col items-baseline mb-4"
                            },
                            [
                              _c("div", { staticClass: "flex-cont-col" }, [
                                _c(
                                  "h2",
                                  {
                                    staticClass: "m-0 mb-8 text-2xl text-black",
                                    class: _vm.theme.title
                                  },
                                  [
                                    _vm._v(
                                      "\n                  " +
                                        _vm._s(_vm.params.title) +
                                        "\n                "
                                    )
                                  ]
                                ),
                                _vm._v(" "),
                                _c("p", [_vm._v(_vm._s(_vm.params.text))])
                              ]),
                              _vm._v(" "),
                              _vm.type == "resource-edit"
                                ? _c("resource-edit", {
                                    staticClass: "w-full sm:w-172",
                                    attrs: {
                                      "prop-resource-name": _vm.params.resource
                                    },
                                    on: {
                                      save: function($event) {
                                        return _vm.confirm()
                                      },
                                      close: function($event) {
                                        return _vm.hide()
                                      }
                                    }
                                  })
                                : _vm._e()
                            ],
                            1
                          )
                        ]),
                        _vm._v(" "),
                        !_vm.type
                          ? _c(
                              "div",
                              {
                                staticClass:
                                  "\n              flex flex-row\n              items-center\n              justify-between\n              px-4\n              py-3\n              bg-gray-100\n              sm:justify-end\n            "
                              },
                              [
                                _c(
                                  "button",
                                  {
                                    staticClass:
                                      "px-3 py-2 ml-0 mr-3 text-blue sm:ml-auto no-outline",
                                    on: {
                                      click: function($event) {
                                        return _vm.confirm(false)
                                      }
                                    }
                                  },
                                  [
                                    _vm._v(
                                      "\n              " +
                                        _vm._s(
                                          _vm.params.cancelText ||
                                            _vm.defaultCancelText
                                        ) +
                                        "\n            "
                                    )
                                  ]
                                ),
                                _vm._v(" "),
                                _c(
                                  "button",
                                  {
                                    staticClass:
                                      "\n                px-3\n                py-2\n                text-white\n                rounded-none\n                bg-blue\n                tx-bold\n                focus:outline-none\n              ",
                                    on: {
                                      click: function($event) {
                                        return _vm.confirm(true)
                                      }
                                    }
                                  },
                                  [
                                    _vm._v(
                                      "\n              " +
                                        _vm._s(
                                          _vm.params.confirmText ||
                                            _vm.defaultConfirmText
                                        ) +
                                        "\n            "
                                    )
                                  ]
                                )
                              ]
                            )
                          : _vm._e()
                      ]
                    )
                  ]
            ],
            2
          )
        ])
      : _vm._e()
  ])
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  var __vue_inject_styles__$1 = function (inject) {
    if (!inject) { return }
    inject("data-v-1786665d_0", { source: "\n.modal-wrapper[data-v-1786665d] {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  width: 300px;\n  height: 200px;\n  z-index: 1000;\n  border-radius: 2px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.modal-buttons[data-v-1786665d] {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  display: flex;\n}\n.modal-button[data-v-1786665d] {\n  flex-grow: 1;\n}\n", map: {"version":3,"sources":["/app/estia/src/components/DialogModal.vue"],"names":[],"mappings":";AA+KA;EACA,eAAA;EACA,QAAA;EACA,SAAA;EACA,gCAAA;EACA,YAAA;EACA,aAAA;EACA,aAAA;EACA,kBAAA;EACA,wEAAA;AACA;AACA;EACA,kBAAA;EACA,SAAA;EACA,OAAA;EACA,QAAA;EACA,aAAA;AACA;AACA;EACA,YAAA;AACA","file":"DialogModal.vue","sourcesContent":["<template>\n  <transition name=\"fade\">\n    <div v-if=\"visible\" class=\"fixed inset-0 z-50\">\n      <div\n        :class=\"$theme.backdropBgColor\"\n        class=\"absolute inset-0 opacity-50 bg-gray-dark\"\n        @click=\"hide()\"\n      />\n      <div\n        ref=\"backdrop\"\n        class=\"absolute inset-0 flex flex-col items-center justify-center\"\n        @click=\"handleBackdropClick($event)\"\n      >\n        <div v-if=\"type == 'change_password'\">\n          <change-password :params=\"params\" @done=\"confirm\" />\n        </div>\n        <template v-else-if=\"type == 'checkin'\">\n          <check-in-modal\n            :params=\"params\"\n            :class=\"is_mobile ? 'h-full w-full' : ''\"\n            @done=\"confirm\"\n          />\n        </template>\n        <template v-else-if=\"type == 'checkout'\">\n          <check-in-modal\n            :params=\"params\"\n            :class=\"is_mobile ? 'h-full w-full' : ''\"\n            @done=\"confirm\"\n          />\n        </template>\n        <template v-else-if=\"type == 'import-csv'\">\n          <import-csv-modal :params=\"params\" @done=\"confirm\" />\n        </template>\n        <template v-else-if=\"$modalWidgets[type]\">\n          <component\n            :is=\"$modalWidgets[type]\"\n            :params=\"params\"\n            @done=\"confirm\"\n          />\n        </template>\n        <template v-else>\n          <div\n            :class=\"is_mobile ? 'h-full w-full' : ''\"\n            class=\"\n              flex flex-col\n              p-5\n              bg-white\n              rounded-none\n              shadow-2xl\n              sm:rounded-lg\n            \"\n          >\n            <div class=\"flex-grow p-4\">\n              <div class=\"flex flex-col items-baseline mb-4\">\n                <div class=\"flex-cont-col\">\n                  <h2 class=\"m-0 mb-8 text-2xl text-black\" :class=\"theme.title\">\n                    {{ params.title }}\n                  </h2>\n                  <p>{{ params.text }}</p>\n                </div>\n                <resource-edit\n                  v-if=\"type == 'resource-edit'\"\n                  :prop-resource-name=\"params.resource\"\n                  class=\"w-full sm:w-172\"\n                  @save=\"confirm()\"\n                  @close=\"hide()\"\n                />\n              </div>\n            </div>\n            <div\n              v-if=\"!type\"\n              class=\"\n                flex flex-row\n                items-center\n                justify-between\n                px-4\n                py-3\n                bg-gray-100\n                sm:justify-end\n              \"\n            >\n              <button\n                class=\"px-3 py-2 ml-0 mr-3 text-blue sm:ml-auto no-outline\"\n                @click=\"confirm(false)\"\n              >\n                {{ params.cancelText || defaultCancelText }}\n              </button>\n              <button\n                class=\"\n                  px-3\n                  py-2\n                  text-white\n                  rounded-none\n                  bg-blue\n                  tx-bold\n                  focus:outline-none\n                \"\n                @click=\"confirm(true)\"\n              >\n                {{ params.confirmText || defaultConfirmText }}\n              </button>\n            </div>\n          </div>\n        </template>\n      </div>\n    </div>\n  </transition>\n</template>\n\n<script>\nimport Dialog from \"../plugins/dialog\";\nimport ChangePassword from \"@/components/ChangePassword.vue\";\n\nexport default {\n  name: \"DialogModal\",\n  components: {\n    \"change-password\": ChangePassword,\n  },\n  data() {\n    return {\n      // variable that shows/hides modal\n      visible: false,\n      type: \"\",\n      params: {},\n      defaultCancelText: \"Annulla\",\n      defaultConfirmText: \"Conferma\",\n      onConfirm: {},\n      theme: {},\n    };\n  },\n  computed: {\n    themeTitle() {\n      return this.theme.title || this.$theme.modal.title;\n    },\n  },\n  beforeMount() {\n    Dialog.EventBus.$on(\"show\", this.show);\n  },\n  beforeDestroy() {\n    Dialog.EventBus.$off(\"show\", this.show);\n  },\n  methods: {\n    hide() {\n      // method for closing modal\n      this.log(\"hide\");\n      this.visible = false;\n    },\n    confirm(result) {\n      this.log(\"confirm\");\n      this.hide();\n      this.onConfirm(result);\n    },\n    show(params) {\n      this.params = params;\n      this.type = params.type;\n      this.onConfirm = params.onConfirm;\n      this.theme = params.theme;\n\n      // making modal visible\n      this.visible = true;\n    },\n    handleBackdropClick(event) {\n      if (this.params.disableBackdropHide) {\n        return;\n      }\n\n      if (this.$refs.backdrop == event.target) {\n        this.hide();\n      }\n    },\n  },\n};\n</script>\n\n<style scoped>\n.modal-wrapper {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  width: 300px;\n  height: 200px;\n  z-index: 1000;\n  border-radius: 2px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n}\n.modal-buttons {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  display: flex;\n}\n.modal-button {\n  flex-grow: 1;\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$1 = "data-v-1786665d";
  /* module identifier */
  var __vue_module_identifier__$1 = undefined;
  /* functional template */
  var __vue_is_functional_template__$1 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$1 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    createInjector,
    undefined,
    undefined
  );

// we need our modal component

var Dialog = {
  // every plugin for Vue.js needs install method
  // this method will run after Vue.use(<your-plugin-here>) is executed
  install: function install(Vue, options) {
    // We must create new Eventbus
    // which is just another Vue instance that will be listening for and emiting events from our main instance
    // this EventBus will be available as Modal.EventBus
    this.EventBus = new Vue();

    // making our modal component global
    Vue.component("modal-dialog", __vue_component__$1);

    // exposing global $modal object with method show()
    // method show() takes object params as argument
    // inside this object we can have modal title, text, styles... and also our callback confirm function
    Vue.prototype.$dialog = {
      show: function show(params) {
        // if we use this.$modal.show(params) inside our original Vue instance
        // we will emit 'show' event with parameters 'params'
        Dialog.EventBus.$emit("show", params);
      }
    };
  }
};

//

var script$2 = {
  components: {},
  data: function data() {
    return {
      // variable that shows/hides modal
      visible: false,
      type: '',
      params: {},
      cancelText: 'Annulla',
      confirmText: 'Conferma',
      onConfirm: {},
    };
  },
  methods: {
    hide: function hide() {
      // method for closing modal
      this.visible = false;
      this.params = {};
    },
    confirm: function confirm(result) {
      this.hide();
      this.onConfirm(result);
    },
    show: function show(params) {
      var this$1 = this;

      this.params = params;
      this.type = params.type;
      this.onConfirm = params.onConfirm;

      // making modal visible
      this.visible = true;

      setTimeout(function () {
        this$1.hide();
      }, 1500);
    },
    handleBackdropClick: function handleBackdropClick(event) {
      if (this.$refs.backdrop == event.target) {
        this.hide();
      }
    },
  },
  beforeMount: function beforeMount() {
    Alert.EventBus.$on('show', this.show);
  },
  beforeDestroy: function beforeDestroy() {
    Alert.EventBus.$off('show', this.show);
  },
  computed:{
    icon: function icon() {
      switch(this.type) {
        case 'success': return 'fas fa-check';
        case 'error': return 'fas fa-times';
        case 'warn': return 'fas fa-exclamation';
        default: return 'fas fa-info';
      }
    },
    theming: function theming() {
      var theme_color = 'info';
      switch(this.type) {
        case 'success': 
          theme_color = 'green';
          break;
        case 'warn': 
          theme_color = 'orange';
          break;
        case 'error': 
          theme_color = 'red';
          break;
        default: 
          theme_color = 'blue';
          break;
      }

      return {
        close: ("text-" + theme_color + "-800"),
        title: ("text-" + theme_color + "-700"),
        side_bar: ("bg-" + theme_color + "-500"),
        text: ("text-" + theme_color + "-700"),
        icon: {
          id: this.icon,
          bg: ("bg-" + theme_color + "-500")
        },
        bg: ("bg-" + theme_color + "-100")
      }
    }
  }
};

/* script */
var __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("transition", { attrs: { name: "fade" } }, [
    _vm.visible
      ? _c(
          "div",
          {
            staticClass:
              "min-h-12 z-50 fixed bottom-0 mb-10 w-full px-10 flex flex-row justify-center"
          },
          [
            _vm.type
              ? _c(
                  "div",
                  {
                    staticClass:
                      " w-4/12 shadow flex flex-row justify-between items-center",
                    class: _vm.theming.bg
                  },
                  [
                    _c("div", {
                      staticClass: "h-full w-1",
                      class: _vm.theming.side_bar
                    }),
                    _vm._v(" "),
                    _c(
                      "div",
                      { staticClass: "w-full px-4 py-2 pr-0 flex flex-row" },
                      [
                         _vm._e(),
                        _vm._v(" "),
                        _c("div", { staticClass: "flex flex-col w-9/12" }, [
                          _c(
                            "p",
                            {
                              staticClass: "text-lg leading-6 font-bold mb-3",
                              class: _vm.theming.title
                            },
                            [_vm._v(_vm._s(_vm.params.title))]
                          ),
                          _vm._v(" "),
                          _c("p", {
                            staticClass: "text-sm leading-5",
                            class: _vm.theming.text,
                            domProps: { innerHTML: _vm._s(_vm.params.text) }
                          })
                        ])
                      ]
                    ),
                    _vm._v(" "),
                     _vm._e()
                  ]
                )
              : _vm._e()
          ]
        )
      : _vm._e()
  ])
};
var __vue_staticRenderFns__$2 = [];
__vue_render__$2._withStripped = true;

  /* style */
  var __vue_inject_styles__$2 = function (inject) {
    if (!inject) { return }
    inject("data-v-142c44ba_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"Alert.vue"}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$2 = "data-v-142c44ba";
  /* module identifier */
  var __vue_module_identifier__$2 = undefined;
  /* functional template */
  var __vue_is_functional_template__$2 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$2 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    false,
    createInjector,
    undefined,
    undefined
  );

// we need our modal component

var Alert = {
  // every plugin for Vue.js needs install method
  // this method will run after Vue.use(<your-plugin-here>) is executed
  install: function install(Vue, options) {
    // We must create new Eventbus
    // which is just another Vue instance that will be listening for and emiting events from our main instance
    // this EventBus will be available as Modal.EventBus
    this.EventBus = new Vue();

    // making our modal component global
    Vue.component("aw-alert", __vue_component__$2);

    // exposing global $modal object with method show()
    // method show() takes object params as argument
    // inside this object we can have modal title, text, styles... and also our callback confirm function
    Vue.prototype.$alert = {
      show: function show(params) {
        // if we use this.$modal.show(params) inside our original Vue instance
        // we will emit 'show' event with parameters 'params'
        Alert.EventBus.$emit("show", params);
      },
      success: function success(params) {
        params.type='success';
        Alert.EventBus.$emit("show", params);
      },
      warn: function warn(params) {
        params.type='warn';
        Alert.EventBus.$emit("show", params);
      },
      error: function error(params) {
        params.type='error';
        Alert.EventBus.$emit("show", params);
      },
      info: function info(params) {
        params.type='info';
        Alert.EventBus.$emit("show", params);
      }
    };
  }
};

function plugins(Vue) {
  Vue.use(Dialog);
  Vue.use(Alert);
  Vue.use(VCalendar);
  Vue.use(VLazyImagePlugin);
  Vue.use(VueWindowSize);
}

var it = {};

var en = {};

var locales = {
  it: it,
  en: en
};

Vue.use(VueI18n);

var translations = new VueI18n({
  locale: "it",
  messages: locales
});

var filters = {
  leftpad: function(value, number) {
    if ( number === void 0 ) number = 4;

    return value.toString().padStart(number, "0");
  },
  count: function(value) {
    if (value != undefined && value != null) {
      return value.length;
    }
    return 0;
  },
  uppercase: function(value) {
    if (value != undefined && value != null) {
      return value.toUpperCase();
    }
  },
  capitalize: function(value) {
    if (value != undefined && value != null && value != "") {
      return value[0].toUpperCase() + value.substring(1, value.length);
    }
  },
  date: function(value, format) {
    if (!value) { return ""; }

    var date = moment(value);

    if (!date.isValid()) { return ""; }
    return format ? date.format(format) : date;
  },
  number: function(value) {
    var number;
    if (value < "999") {
      return value;
    }
    if (value < "999999") {
      number = value / 1000;
      return number.toFixed(1).replace(".", ",") + " K";
    }
    if (value < 999999999) {
      number = value / 1000000;
      return number.toFixed(1).replace(".", ",") + " M";
    }
  },
  round: function(value, digits) {
    if ( digits === void 0 ) digits = 2;

    // Round only if it is float
    if (value % 1 === 0) {
      return value;
    }

    // TODO: round locale wise
    return parseFloat(value)
      .toFixed(digits)
      .replace(".", ",");
  },
  percentage: function(value, digits) {
    if ( digits === void 0 ) digits = 1;

    var percValue = value * 100;

    // TODO: round locale wise
    var parsePercValue = parseFloat(percValue)
      .toFixed(digits)
      .replace(".", ",");

    return parsePercValue + "%";
  },
  time_ago: function(value) {
    if (!value) { return ""; }
    return moment(value)
      .locale("it")
      .fromNow();
  },
  on_empty: function on_empty(value, message) {
    if (!value) { return message; }
    return value;
  },
  translate: function translate(key) {
    var locale = translations.locale;
    var messages = translations.messages[locale];
    return helpers.deepPick(messages, key) || key;
  },
  week_date: function week_date(week, year) {
    if ( year === void 0 ) year = moment().year();

    if (!week) { return ""; }
    var week_as_string = moment()
      .day("Sunday")
      .year(year)
      .week(week);
    return {
      start: week_as_string.startOf("week").format("L"),
      end: week_as_string.endOf("week").format("L")
    };
  },
  prettify: function prettify(value, lang) {
    switch (lang) {
      case "json":
        return JSON.stringify(value, null, "\t");
      default:
        return value;
    }
  },
  json: function json(value) {
    /* value = value
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t'); */
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(e);
      return null;
    }
  }
};

function filters$1(Vue, userFilters) {
  Object.keys(filters).forEach(function (key) { return Vue.filter(key, filters[key]); });
  Object.keys(userFilters).forEach(function (key) { return Vue.filter(key, userFilters[key]); });
}

function resources (Vue, resources, options) {

  Vue.prototype.resources = {};

  Object.keys(resources).forEach(function (resource) {
    Vue.prototype.resources[resource] = resources[resource];
  });
}

//

var defaultErrorTexts = {
  "wrong-credentials": "Credenziali non valide",
  "generic-error": "Errore generico",
};

var script$3 = {
  name: "Login",
  props: {
    cardClass: {
      required: false,
      type: String,
      default: function default$1() {
        return this.$theme.loginCardClass;
      },
    },
    bgImage: {
      required: false,
      type: String,
      default: "",
    },
    bgColor: {
      required: false,
      type: String,
      default: "bg-white",
    },
    errorTexts: {
      required: false,
      type: Object,
    },
  },
  data: function data() {
    return {
      email: "",
      loginStep: "login",
      credentials: {
        username: "",
        password: "",
      },
      isLoading: false,
      mergedErrorTexts: {},
      errorText: "",
      errorCodeDict: {
        user_not_found: "Matricola non appartenente a nessun utente",
        username_not_sent: "Inserisci una matricola nel campo di testo",
        password_not_insert: "Inserire la password",
      },
    };
  },
  computed: {
    canLogin: function () {
      return (
        this.credentials.username !== "" && this.credentials.password !== ""
      );
    },
    submitDisabled: function () {
      return !this.canLogin || this.isLoading;
    },
    submitText: function () {
      if (this.isLoading) {
        return "Caricamento";
      }

      return this.errorText === "" ? "Login" : "Errore";
    },
  },
  mounted: function mounted() {
    if (this.$refs.username) {
      this.$refs.username.focus();
    }

    this.mergedErrorTexts = Object.assign({}, defaultErrorTexts,
      this.errorTexts);
  },
  methods: {
    login: async function login() {
      var $route = this.$route;
      var $router = this.$router;

      this.errorText = "";

      this.isLoading = true;

      var loginData = await this.$api.login(
        this.credentials.username,
        this.credentials.password
      );

      var errorCode = loginData.error || "generic-error";

      // Try to look up for error messages from props and default ones
      if (!(errorCode in this.mergedErrorTexts)) {
        // revert to "generic-error" when errorCode is not recognized
        errorCode = "generic-error";
      }

      this.errorText = this.mergedErrorTexts[errorCode];

      var redirect = $route.query.redirect || "";

      this.isLoading = false;

      if (!loginData.error) {
        $router.push("/" + redirect);
      }
    },
    sendPasswordReset: function () {
      var this$1 = this;

      this.isLoading = true;
      this.errorText = "";

      resetPassword(this.email).then(
        function (data) {
          this$1.isLoading = false;
          this$1.email = "";
          this$1.loginStep = "success";
        },
        function (err) {
          this$1.email = "";
          this$1.errorText = this$1.errorCodeDict[err.code];
          this$1.isLoading = false;
        }
      );
    },
    resetPassword: function ($event) {
      $event.stopPropagation();
      $event.preventDefault();

      this.errorText = "";
      this.loginStep = "passwordreset";
    },
    goBack: function () {
      this.loginStep = "login";
      this.errorText = "";
    },
  },
};

/* script */
var __vue_script__$3 = script$3;

/* template */
var __vue_render__$3 = function() {
  var _obj, _obj$1;
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass:
        "\n    flex flex-col\n    items-center\n    justify-center\n    h-screen\n    px-4\n    bg-center bg-no-repeat bg-cover\n    sm:px-0\n  ",
      class: ((_obj = {}), (_obj[_vm.bgColor] = true), _obj),
      style: { "background-image": _vm.bgImage }
    },
    [
      _c(
        "div",
        { class: ((_obj$1 = {}), (_obj$1[_vm.cardClass] = true), _obj$1) },
        [
          _c(
            "div",
            { staticClass: "flex flex-row items-center justify-center w-full" },
            [
              _vm._t("logo", function() {
                return [_vm._v(" Logo ")]
              })
            ],
            2
          ),
          _vm._v(" "),
          _c(
            "form",
            {
              staticClass: "mt-12",
              on: {
                submit: function($event) {
                  $event.preventDefault();
                  return _vm.login.apply(null, arguments)
                }
              }
            },
            [
              _c(
                "div",
                { staticClass: "px-1 py-3 sm:px-4" },
                [
                  _vm._t("title", function() {
                    return [
                      _c(
                        "h1",
                        { staticClass: "text-3xl font-semibold text-gray-600" },
                        [_vm._v("Accedi")]
                      )
                    ]
                  }),
                  _vm._v(" "),
                  _c(
                    "div",
                    { staticClass: "flex flex-col mt-4 mb-4" },
                    [
                      _vm._t(
                        "username",
                        function() {
                          return [
                            _c(
                              "label",
                              {
                                staticClass:
                                  "mb-1 ml-2 text-xs text-gray-600 text-blue-dark",
                                attrs: { for: "username" }
                              },
                              [_vm._v("Username")]
                            ),
                            _vm._v(" "),
                            _c("input", {
                              directives: [
                                {
                                  name: "model",
                                  rawName: "v-model",
                                  value: _vm.credentials.username,
                                  expression: "credentials.username"
                                }
                              ],
                              ref: "username",
                              staticClass: "py-2",
                              attrs: {
                                id: "username",
                                placeholder: "Inserisci username",
                                type: "text"
                              },
                              domProps: { value: _vm.credentials.username },
                              on: {
                                input: function($event) {
                                  if ($event.target.composing) {
                                    return
                                  }
                                  _vm.$set(
                                    _vm.credentials,
                                    "username",
                                    $event.target.value
                                  );
                                }
                              }
                            })
                          ]
                        },
                        { credentials: _vm.credentials }
                      )
                    ],
                    2
                  ),
                  _vm._v(" "),
                  _c(
                    "div",
                    { staticClass: "flex flex-col mb-4" },
                    [
                      _vm._t(
                        "password",
                        function() {
                          return [
                            _c(
                              "label",
                              {
                                staticClass:
                                  "mb-1 ml-2 text-xs text-gray-600 text-blue-dark",
                                attrs: { for: "password" }
                              },
                              [_vm._v("Password")]
                            ),
                            _vm._v(" "),
                            _c("input", {
                              directives: [
                                {
                                  name: "model",
                                  rawName: "v-model",
                                  value: _vm.credentials.password,
                                  expression: "credentials.password"
                                }
                              ],
                              staticClass: "py-2",
                              attrs: {
                                id: "password",
                                placeholder: "Inserisci password",
                                type: "password"
                              },
                              domProps: { value: _vm.credentials.password },
                              on: {
                                input: function($event) {
                                  if ($event.target.composing) {
                                    return
                                  }
                                  _vm.$set(
                                    _vm.credentials,
                                    "password",
                                    $event.target.value
                                  );
                                }
                              }
                            })
                          ]
                        },
                        { credentials: _vm.credentials }
                      ),
                      _vm._v(" "),
                      _c(
                        "div",
                        {
                          staticClass:
                            "flex flex-row justify-between items-center"
                        },
                        [
                          _vm._t(
                            "remember-me",
                            function() {
                              return [
                                _c(
                                  "div",
                                  {
                                    staticClass:
                                      "flex flex-row justify-center items-center"
                                  },
                                  [
                                    _c("input", {
                                      directives: [
                                        {
                                          name: "model",
                                          rawName: "v-model",
                                          value: _vm.credentials.remember_me,
                                          expression: "credentials.remember_me"
                                        }
                                      ],
                                      attrs: {
                                        id: "remember-me",
                                        type: "checkbox"
                                      },
                                      domProps: {
                                        checked: Array.isArray(
                                          _vm.credentials.remember_me
                                        )
                                          ? _vm._i(
                                              _vm.credentials.remember_me,
                                              null
                                            ) > -1
                                          : _vm.credentials.remember_me
                                      },
                                      on: {
                                        change: function($event) {
                                          var $$a = _vm.credentials.remember_me,
                                            $$el = $event.target,
                                            $$c = $$el.checked ? true : false;
                                          if (Array.isArray($$a)) {
                                            var $$v = null,
                                              $$i = _vm._i($$a, $$v);
                                            if ($$el.checked) {
                                              $$i < 0 &&
                                                _vm.$set(
                                                  _vm.credentials,
                                                  "remember_me",
                                                  $$a.concat([$$v])
                                                );
                                            } else {
                                              $$i > -1 &&
                                                _vm.$set(
                                                  _vm.credentials,
                                                  "remember_me",
                                                  $$a
                                                    .slice(0, $$i)
                                                    .concat($$a.slice($$i + 1))
                                                );
                                            }
                                          } else {
                                            _vm.$set(
                                              _vm.credentials,
                                              "remember_me",
                                              $$c
                                            );
                                          }
                                        }
                                      }
                                    }),
                                    _vm._v(" "),
                                    _c(
                                      "label",
                                      {
                                        staticClass: "ml-3",
                                        attrs: { for: "remember-me" }
                                      },
                                      [_vm._v("Ricordami")]
                                    )
                                  ]
                                )
                              ]
                            },
                            { credentials: _vm.credentials }
                          ),
                          _vm._v(" "),
                          _vm._t("forgot-password", function() {
                            return [
                              _c(
                                "span",
                                {
                                  staticClass:
                                    "\n                  mt-5\n                  ml-auto\n                  mr-auto\n                  text-xs\n                  italic\n                  underline\n                  cursor-pointer\n                  text-blue\n                "
                                },
                                [
                                  _vm._v(
                                    "\n                Password dimenticata?\n              "
                                  )
                                ]
                              )
                            ]
                          })
                        ],
                        2
                      )
                    ],
                    2
                  )
                ],
                2
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "flex flex-col items-center justify-center px-4"
                },
                [
                  _vm._t(
                    "submit",
                    function() {
                      return [
                        _c(
                          "button",
                          {
                            staticClass:
                              "\n              w-full\n              p-3\n              ml-0\n              text-white\n              rounded-none\n              outline-none\n              sm:w-32\n              sm:ml-auto\n              text-normal\n            ",
                            class: {
                              "bg-blue-light cursor-not-allowed":
                                _vm.submitDisabled,
                              "bg-blue cursor-pointer": !_vm.submitDisabled
                            },
                            attrs: {
                              disabled: _vm.submitDisabled,
                              type: "submit"
                            }
                          },
                          [
                            _vm._v(
                              "\n            " +
                                _vm._s(_vm.submitText) +
                                "\n          "
                            )
                          ]
                        )
                      ]
                    },
                    {
                      submitText: _vm.submitText,
                      submitDisabled: _vm.submitDisabled,
                      submit: _vm.login
                    }
                  ),
                  _vm._v(" "),
                  _vm._t("register"),
                  _vm._v(" "),
                  _vm._t(
                    "error",
                    function() {
                      return [
                        _c(
                          "div",
                          {
                            staticClass:
                              "\n              flex flex-col\n              items-center\n              justify-center\n              h-6\n              my-5\n              text-lg text-center text-red-700\n            ",
                            class: {
                              "opacity-0": _vm.errorText == "",
                              "opacity-100": _vm.errorText != ""
                            }
                          },
                          [
                            _vm._v(
                              "\n            " +
                                _vm._s(_vm.errorText) +
                                "\n          "
                            )
                          ]
                        )
                      ]
                    },
                    { errorText: _vm.errorText }
                  )
                ],
                2
              )
            ]
          )
        ]
      )
    ]
  )
};
var __vue_staticRenderFns__$3 = [];
__vue_render__$3._withStripped = true;

  /* style */
  var __vue_inject_styles__$3 = function (inject) {
    if (!inject) { return }
    inject("data-v-0a7a31d1_0", { source: "\n::placeholder {\n@apply italic text-xs;\n}\ninput {\n@apply w-32;\n}\n", map: {"version":3,"sources":["/app/estia/src/components/Login.vue"],"names":[],"mappings":";AA+RA;AACA,qBAAA;AACA;AAEA;AACA,WAAA;AACA","file":"Login.vue","sourcesContent":["<template>\n  <div\n    :style=\"{ 'background-image': bgImage }\"\n    :class=\"{\n      [bgColor]: true,\n    }\"\n    class=\"\n      flex flex-col\n      items-center\n      justify-center\n      h-screen\n      px-4\n      bg-center bg-no-repeat bg-cover\n      sm:px-0\n    \"\n  >\n    <div\n      :class=\"{\n        [cardClass]: true,\n      }\"\n    >\n      <div class=\"flex flex-row items-center justify-center w-full\">\n        <slot name=\"logo\"> Logo </slot>\n      </div>\n\n      <form class=\"mt-12\" @submit.prevent=\"login\">\n        <div class=\"px-1 py-3 sm:px-4\">\n          <slot name=\"title\">\n            <h1 class=\"text-3xl font-semibold text-gray-600\">Accedi</h1>\n          </slot>\n          <div class=\"flex flex-col mt-4 mb-4\">\n            <slot name=\"username\" :credentials=\"credentials\">\n              <label\n                for=\"username\"\n                class=\"mb-1 ml-2 text-xs text-gray-600 text-blue-dark\"\n                >Username</label\n              >\n              <input\n                id=\"username\"\n                ref=\"username\"\n                v-model=\"credentials.username\"\n                placeholder=\"Inserisci username\"\n                class=\"py-2\"\n                type=\"text\"\n              />\n            </slot>\n          </div>\n          <div class=\"flex flex-col mb-4\">\n            <slot name=\"password\" :credentials=\"credentials\">\n              <label\n                for=\"password\"\n                class=\"mb-1 ml-2 text-xs text-gray-600 text-blue-dark\"\n                >Password</label\n              >\n              <input\n                id=\"password\"\n                v-model=\"credentials.password\"\n                placeholder=\"Inserisci password\"\n                class=\"py-2\"\n                type=\"password\"\n              />\n            </slot>\n            <div class=\"flex flex-row justify-between items-center\">\n              <slot name=\"remember-me\" :credentials=\"credentials\">\n                <div class=\"flex flex-row justify-center items-center\">\n                  <input\n                    id=\"remember-me\"\n                    v-model=\"credentials.remember_me\"\n                    type=\"checkbox\"\n                  />\n                  <label class=\"ml-3\" for=\"remember-me\">Ricordami</label>\n                </div>\n              </slot>\n              <slot name=\"forgot-password\">\n                <span\n                  class=\"\n                    mt-5\n                    ml-auto\n                    mr-auto\n                    text-xs\n                    italic\n                    underline\n                    cursor-pointer\n                    text-blue\n                  \"\n                >\n                  Password dimenticata?\n                </span>\n              </slot>\n            </div>\n          </div>\n        </div>\n        <div class=\"flex flex-col items-center justify-center px-4\">\n          <slot\n            name=\"submit\"\n            :submitText=\"submitText\"\n            :submitDisabled=\"submitDisabled\"\n            :submit=\"login\"\n          >\n            <button\n              :disabled=\"submitDisabled\"\n              type=\"submit\"\n              class=\"\n                w-full\n                p-3\n                ml-0\n                text-white\n                rounded-none\n                outline-none\n                sm:w-32\n                sm:ml-auto\n                text-normal\n              \"\n              :class=\"{\n                'bg-blue-light cursor-not-allowed': submitDisabled,\n                'bg-blue cursor-pointer': !submitDisabled,\n              }\"\n            >\n              {{ submitText }}\n            </button>\n          </slot>\n          <slot name=\"register\"> </slot>\n          <slot name=\"error\" :errorText=\"errorText\">\n            <div\n              :class=\"{\n                'opacity-0': errorText == '',\n                'opacity-100': errorText != '',\n              }\"\n              class=\"\n                flex flex-col\n                items-center\n                justify-center\n                h-6\n                my-5\n                text-lg text-center text-red-700\n              \"\n            >\n              {{ errorText }}\n            </div>\n          </slot>\n        </div>\n      </form>\n    </div>\n  </div>\n</template>\n<script>\nimport { resetPassword } from \"../utils/auth\";\n\nconst defaultErrorTexts = {\n  \"wrong-credentials\": \"Credenziali non valide\",\n  \"generic-error\": \"Errore generico\",\n};\n\nexport default {\n  name: \"Login\",\n  props: {\n    cardClass: {\n      required: false,\n      type: String,\n      default() {\n        return this.$theme.loginCardClass;\n      },\n    },\n    bgImage: {\n      required: false,\n      type: String,\n      default: \"\",\n    },\n    bgColor: {\n      required: false,\n      type: String,\n      default: \"bg-white\",\n    },\n    errorTexts: {\n      required: false,\n      type: Object,\n    },\n  },\n  data() {\n    return {\n      email: \"\",\n      loginStep: \"login\",\n      credentials: {\n        username: \"\",\n        password: \"\",\n      },\n      isLoading: false,\n      mergedErrorTexts: {},\n      errorText: \"\",\n      errorCodeDict: {\n        user_not_found: \"Matricola non appartenente a nessun utente\",\n        username_not_sent: \"Inserisci una matricola nel campo di testo\",\n        password_not_insert: \"Inserire la password\",\n      },\n    };\n  },\n  computed: {\n    canLogin: function () {\n      return (\n        this.credentials.username !== \"\" && this.credentials.password !== \"\"\n      );\n    },\n    submitDisabled: function () {\n      return !this.canLogin || this.isLoading;\n    },\n    submitText: function () {\n      if (this.isLoading) {\n        return \"Caricamento\";\n      }\n\n      return this.errorText === \"\" ? \"Login\" : \"Errore\";\n    },\n  },\n  mounted() {\n    if (this.$refs.username) {\n      this.$refs.username.focus();\n    }\n\n    this.mergedErrorTexts = {\n      ...defaultErrorTexts,\n      ...this.errorTexts,\n    };\n  },\n  methods: {\n    async login() {\n      var $route = this.$route;\n      var $router = this.$router;\n\n      this.errorText = \"\";\n\n      this.isLoading = true;\n\n      let loginData = await this.$api.login(\n        this.credentials.username,\n        this.credentials.password\n      );\n\n      let errorCode = loginData.error || \"generic-error\";\n\n      // Try to look up for error messages from props and default ones\n      if (!(errorCode in this.mergedErrorTexts)) {\n        // revert to \"generic-error\" when errorCode is not recognized\n        errorCode = \"generic-error\";\n      }\n\n      this.errorText = this.mergedErrorTexts[errorCode];\n\n      var redirect = $route.query.redirect || \"\";\n\n      this.isLoading = false;\n\n      if (!loginData.error) {\n        $router.push(\"/\" + redirect);\n      }\n    },\n    sendPasswordReset: function () {\n      this.isLoading = true;\n      this.errorText = \"\";\n\n      resetPassword(this.email).then(\n        (data) => {\n          this.isLoading = false;\n          this.email = \"\";\n          this.loginStep = \"success\";\n        },\n        (err) => {\n          this.email = \"\";\n          this.errorText = this.errorCodeDict[err.code];\n          this.isLoading = false;\n        }\n      );\n    },\n    resetPassword: function ($event) {\n      $event.stopPropagation();\n      $event.preventDefault();\n\n      this.errorText = \"\";\n      this.loginStep = \"passwordreset\";\n    },\n    goBack: function () {\n      this.loginStep = \"login\";\n      this.errorText = \"\";\n    },\n  },\n};\n</script>\n<style>\n::placeholder {\n  @apply italic text-xs;\n}\n\ninput {\n  @apply w-32;\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$3 = undefined;
  /* module identifier */
  var __vue_module_identifier__$3 = undefined;
  /* functional template */
  var __vue_is_functional_template__$3 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$3 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script$4 = {
  mounted: function mounted () {
    logout();

    this.$router.push('/login');
  }
};

/* script */
var __vue_script__$4 = script$4;

/* template */
var __vue_render__$4 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div")
};
var __vue_staticRenderFns__$4 = [];
__vue_render__$4._withStripped = true;

  /* style */
  var __vue_inject_styles__$4 = undefined;
  /* scoped */
  var __vue_scope_id__$4 = undefined;
  /* module identifier */
  var __vue_module_identifier__$4 = undefined;
  /* functional template */
  var __vue_is_functional_template__$4 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$4 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
    __vue_inject_styles__$4,
    __vue_script__$4,
    __vue_scope_id__$4,
    __vue_is_functional_template__$4,
    __vue_module_identifier__$4,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$5 = {
  name: 'Main',
  mixins: [SideNavMixin],
  data: function () { return ({
    path: []
  }); },
  watch: {
    $route: {
      handler: function handler () {
        this.format_path_for_breadcrumbs(this.$route.fullPath);
      }
    }
  },
  beforeMount: function beforeMount () {
    this.format_path_for_breadcrumbs(this.$route.fullPath);
    this.listenForSideNavCollapseEvent();
  },
  methods: {
    format_path_for_breadcrumbs: function format_path_for_breadcrumbs (path) {
      var splitted_full_path = path
        .trim()
        .split('/')
        .map(function (item) {
          return {
            disabled: false,
            exact: false,
            href: '/' + item,
            text: item,
            to: item
          }
        });

      this.path = splitted_full_path;
    }
  }
};

/* script */
var __vue_script__$5 = script$5;

/* template */
var __vue_render__$5 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "h-screen" },
    [
      _c("side-nav"),
      _vm._v(" "),
      _c("top-bar"),
      _vm._v(" "),
      _c(
        "div",
        {
          staticClass:
            "bg-gray-100 relative pt-20 min-h-screen transition-all duration-200 ease-in flex flex-col",
          class: _vm.is_collapsed ? "pl-16 pr-2" : "pl-56"
        },
        [
          _c(
            "error-boundary",
            {
              staticClass:
                "max-w-screen-xl mx-auto px-4 pt-6 py-4 flex-grow w-full flex flex-col"
            },
            [
              _c("router-view", {
                key: _vm.$route.fullPath,
                staticClass:
                  "max-w-screen-xl mx-auto px-4 pt-6 py-4 flex-grow w-full flex flex-col overflow-y-auto"
              })
            ],
            1
          )
        ],
        1
      ),
      _vm._v(" "),
      _c("color-swatch")
    ],
    1
  )
};
var __vue_staticRenderFns__$5 = [];
__vue_render__$5._withStripped = true;

  /* style */
  var __vue_inject_styles__$5 = function (inject) {
    if (!inject) { return }
    inject("data-v-2569a3ba_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"Main.vue"}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$5 = undefined;
  /* module identifier */
  var __vue_module_identifier__$5 = undefined;
  /* functional template */
  var __vue_is_functional_template__$5 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$5 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
    __vue_inject_styles__$5,
    __vue_script__$5,
    __vue_scope_id__$5,
    __vue_is_functional_template__$5,
    __vue_module_identifier__$5,
    false,
    createInjector,
    undefined,
    undefined
  );

var defaultNoAuthRouteList = [
];

function router (options) {
  var router = options.router;
  var noAuthRouteList = options.noAuthRouteList ? options.noAuthRouteList : defaultNoAuthRouteList;

  // Is Authenticated
  router.beforeEach(function (to, from, next) {
    if (noAuthRouteList.includes(to.name)) {
      next();
      return
    }

    var authUser = getProfile();
    var routeRequiresAuth = to.matched.some(function (route) {
      return route.meta && route.meta.requiresAuth
    });

    if (!routeRequiresAuth) {
      next();
      return
    }

    if (!authUser) {
      router.push('/login');
      return
    }

    if (to.matched.some(function (record) { return record.meta.requiresAuth; })) {
      var redirectPath = to.path.split('/')[1];

      if (!isLoggedIn()) {
        router.push('/login?redirect=' + redirectPath);
        next(false);
        return
      }
    }

    next();
  });

  // Role based auth
  router.beforeEach(function (to, from, next) {
    if (to.matched.some(function (record) { return record.meta.roles; })) {
      var user = getProfile();

      if (!user) {
        router.push('/login');
        next(false);
      }

      var roleHolder = null;

      // Get the last route role guard
      for (var index in to.matched) {
        var path = to.matched[index];

        if (path.meta && path.meta.roles) {
          roleHolder = path.meta.roles;
        }
      }

      if (roleHolder != null && user != null) {
        // TODO: move this where we can access the Vue instance
        var userRole;

        if (options.roleLookup) {
          userRole = options.roleLookup(user);
        } else {
          userRole = user.role.code.toLowerCase();
        }

        var userHasRole = roleHolder.indexOf(userRole) != -1;

        if (userHasRole) {
          next();
        } else {
          router.push('/login');
          next(false);
        }
      } else {
      // If no roles are provided, simply let the user in
        next();
      }
    } else {
      next();
    }
  });

  var innerRoutes = options.innerRoutes || [];
  var outerRoutes = options.outerRoutes || [];

  var baseComponents = Object.assign({}, {login: __vue_component__$3,
    main: __vue_component__$5},
    options.baseComponents);

  var routes = [
    {
      path: '/login',
      name: 'login',
      component: baseComponents.login,
      meta: {
        requiresAuth: false
      }
    },
    {
      name: 'logout',
      path: '/logout',
      component: __vue_component__$4
    },
    {
      path: baseComponents.mainPath || '/',
      name: 'main',
      component: baseComponents.main,
      meta: {
        requiresAuth: true
      },
      children: innerRoutes
    } ].concat( outerRoutes
  );

  router.addRoutes(routes);

  axios.interceptors.response.use(undefined, function (err) {
    if (err.response.status === 401) {
      router.push('/login');
      return Promise.reject(err)
    }

    return Promise.reject(err)
  });
}

var user = {
  namespaced: true,
  state: {
    user: null,
    token: null
  },
  mutations: {
    set_user: function set_user (state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    set_token: function set_token (state, token) {
      localStorage.setItem('token', token);
      state.token = token;
      // EventBus.$emit('token-changed');
    },
    remove_logged_account: function remove_logged_account (state) {
      state.user.account = null;
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
  actions: {
    set_user: async function set_user (ref, user) {
      var commit = ref.commit;

      commit('set_user', user);
    },
    change_active_account: async function change_active_account (ref, account_id) {
      var commit = ref.commit;

      console.log('change_active_account');
      try {
        var response = await this.$api.post('change-account', { 'account_id': account_id });
        commit('set_token', response.token);
        commit('set_user', response.user);
        return true
      } catch (e) {
        return false
      }
    },
    reload_user: async function reload_user (ref) {
      var commit = ref.commit;

      console.log('reload_user');
      try {
        var response = await axios.get('/api/me');
        commit('set_user', response.data);
        return true
      } catch (e) {
        return false
      }

    },
  },
  getters: {
    accounts: function (state) {
      var accounts = state.user.accounts.map(function (account) {
        account['id'] = account['pk'];
        return account
      });
      return accounts
    }
  }
};

function store (Vue, store) {
  store.registerModule('user', user);
}

function viewFields (Vue, options) {
  Vue.prototype.$viewFields = options.viewFields ? options.viewFields : {};
}

function editFields (Vue, options) {
  Vue.prototype.$editFields = options.editFields ? options.editFields : {};
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$6 = {
  name: 'ChangePasswordStrong',
  props: {
    params: {
      required: true,
      type: Object,
      default: function default$1 () {
        return {
          title: 'Titolo',
          text: 'Testo'
        }
      }
    }
  },
  data: function data () {
    return {
      isLoading: false,
      password: '',
      state: 'idle',
      confirmPassword: '',
      inputType: 'password',
      title: 'Cambia Password',
      confirmText: 'Cambia',
      errors: {},
      rules: [
        {
          code: 'equal',
          label: 'Le password devono coincidere'
        },
        {
          code: 'length',
          label: 'La password deve essere lunga almeno 8 caratteri'
        },
        {
          code: 'number',
          label: 'La password deve contenere almeno 1 numero'
        },
        {
          code: 'uppercase',
          label: 'La password deve contenere almeno 1 lettera maiuscola'
        },
        {
          code: 'special',
          label:
            'La password deve contenere almeno uno tra i seguenti caratteri: !#@?_-;:'
        }
      ]
    }
  },
  computed: {
    passwordsAreEqual: function passwordsAreEqual () {
      if (!this.password && !this.confirmPassword) {
        return false
      }

      return this.password === this.confirmPassword
    },
    passwordIsPristine: function passwordIsPristine () {
      return !this.password && !this.confirmPassword
    },
    passwordError: function passwordError () {
      if (this.passwordIsPristine) {
        return null
      }

      var errors = {};

      if (!this.passwordsAreEqual) {
        errors.equal = true;
      }

      if (this.password == this.password.toLowerCase()) {
        errors.uppercase = true;
      }

      if (this.password.length < 8) {
        errors.length = true;
      }

      if (!/\d/.test(this.password)) {
        errors.number = true;
      }

      this.errors = errors;

      return Object.keys(errors).length > 0
    },
    confirmIsDisabled: function confirmIsDisabled () {
      switch (this.state) {
        case 'idle':
          return this.passwordError || this.passwordIsPristine
        case 'loading':
          return true
        case 'success':
          return false
      }
    }
  },
  mounted: async function mounted () {},
  methods: {
    forward: async function forward () {
      switch (this.state) {
        case 'idle':
          await this.changePassword();
          break
        case 'success':
          await this.confirm(true);
          break
      }
    },
    changePassword: async function changePassword () {
      this.isLoading = true;
      this.confirmText = 'Caricamento';
      this.state = 'loading';

      try {
        var response = await this.$api.act(
          this.params.resourceName,
          this.params.accountId,
          this.params.action,
          {
            password: this.password
          }
        );

        this.state = 'success';
        this.confirmText = 'Chiudi';
      } catch (e) {
        this.confirmText = 'Cambia';
        this.state = 'idle';
      }

      this.isLoading = false;
    },
    confirm: function confirm (result) {
      this.$emit('done', result);
    }
  }
};

/* script */
var __vue_script__$6 = script$6;

/* template */
var __vue_render__$6 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "flex flex-col max-w-2xl w-full bg-white rounded shadow-xl"
    },
    [
      _c("div", { staticClass: "flex-grow p-6 py-4" }, [
        _c("h3", { staticClass: "mb-5 text-xl font-bold text-green-600" }, [
          _vm._v("\n      " + _vm._s(_vm.title) + "\n    ")
        ]),
        _vm._v(" "),
        _vm.state == "idle"
          ? _c("div", [
              _c(
                "ul",
                { staticClass: "mb-5" },
                _vm._l(_vm.rules, function(rule) {
                  return _c(
                    "li",
                    { staticClass: "flex flex-row items-center mb-1" },
                    [
                      _c("div", {
                        staticClass: "w-2 h-2 rounded-full bg-green-500 mr-2"
                      }),
                      _vm._v(
                        "\n          " + _vm._s(rule.label) + "\n          "
                      ),
                      !_vm.passwordIsPristine
                        ? _c(
                            "span",
                            { staticClass: "ml-auto" },
                            [
                              !_vm.errors[rule.code]
                                ? _c("icon", {
                                    staticClass: "text-green-500",
                                    attrs: { name: "check" }
                                  })
                                : _c("icon", {
                                    staticClass: "text-red-500",
                                    attrs: { name: "x" }
                                  })
                            ],
                            1
                          )
                        : _vm._e()
                    ]
                  )
                }),
                0
              ),
              _vm._v(" "),
              _c("div", { staticClass: "flex items-center" }, [
                _c(
                  "div",
                  {
                    staticClass:
                      "ml-auto text-gray-600 cursor-pointer hover:text-gray-700",
                    on: {
                      mouseenter: function($event) {
                        _vm.inputType = "text";
                      },
                      mouseleave: function($event) {
                        _vm.inputType = "password";
                      }
                    }
                  },
                  [_vm._v("\n          Vedi password\n        ")]
                )
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "mb-5" }, [
                _c(
                  "label",
                  { staticClass: "mb-3 text-gray-600", attrs: { for: "" } },
                  [_vm._v("\n          Nuova Password\n        ")]
                ),
                _vm._v(" "),
                _vm.inputType === "checkbox"
                  ? _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.password,
                          expression: "password"
                        }
                      ],
                      attrs: { type: "checkbox" },
                      domProps: {
                        checked: Array.isArray(_vm.password)
                          ? _vm._i(_vm.password, null) > -1
                          : _vm.password
                      },
                      on: {
                        change: function($event) {
                          var $$a = _vm.password,
                            $$el = $event.target,
                            $$c = $$el.checked ? true : false;
                          if (Array.isArray($$a)) {
                            var $$v = null,
                              $$i = _vm._i($$a, $$v);
                            if ($$el.checked) {
                              $$i < 0 && (_vm.password = $$a.concat([$$v]));
                            } else {
                              $$i > -1 &&
                                (_vm.password = $$a
                                  .slice(0, $$i)
                                  .concat($$a.slice($$i + 1)));
                            }
                          } else {
                            _vm.password = $$c;
                          }
                        }
                      }
                    })
                  : _vm.inputType === "radio"
                  ? _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.password,
                          expression: "password"
                        }
                      ],
                      attrs: { type: "radio" },
                      domProps: { checked: _vm._q(_vm.password, null) },
                      on: {
                        change: function($event) {
                          _vm.password = null;
                        }
                      }
                    })
                  : _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.password,
                          expression: "password"
                        }
                      ],
                      attrs: { type: _vm.inputType },
                      domProps: { value: _vm.password },
                      on: {
                        input: function($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.password = $event.target.value;
                        }
                      }
                    })
              ]),
              _vm._v(" "),
              _c("div", [
                _c(
                  "label",
                  { staticClass: "mb-3 text-gray-600", attrs: { for: "" } },
                  [_vm._v("\n          Conferma Nuova Password\n        ")]
                ),
                _vm._v(" "),
                _vm.inputType === "checkbox"
                  ? _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.confirmPassword,
                          expression: "confirmPassword"
                        }
                      ],
                      attrs: { type: "checkbox" },
                      domProps: {
                        checked: Array.isArray(_vm.confirmPassword)
                          ? _vm._i(_vm.confirmPassword, null) > -1
                          : _vm.confirmPassword
                      },
                      on: {
                        change: function($event) {
                          var $$a = _vm.confirmPassword,
                            $$el = $event.target,
                            $$c = $$el.checked ? true : false;
                          if (Array.isArray($$a)) {
                            var $$v = null,
                              $$i = _vm._i($$a, $$v);
                            if ($$el.checked) {
                              $$i < 0 &&
                                (_vm.confirmPassword = $$a.concat([$$v]));
                            } else {
                              $$i > -1 &&
                                (_vm.confirmPassword = $$a
                                  .slice(0, $$i)
                                  .concat($$a.slice($$i + 1)));
                            }
                          } else {
                            _vm.confirmPassword = $$c;
                          }
                        }
                      }
                    })
                  : _vm.inputType === "radio"
                  ? _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.confirmPassword,
                          expression: "confirmPassword"
                        }
                      ],
                      attrs: { type: "radio" },
                      domProps: { checked: _vm._q(_vm.confirmPassword, null) },
                      on: {
                        change: function($event) {
                          _vm.confirmPassword = null;
                        }
                      }
                    })
                  : _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.confirmPassword,
                          expression: "confirmPassword"
                        }
                      ],
                      attrs: { type: _vm.inputType },
                      domProps: { value: _vm.confirmPassword },
                      on: {
                        input: function($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.confirmPassword = $event.target.value;
                        }
                      }
                    })
              ])
            ])
          : _vm._e(),
        _vm._v(" "),
        _vm.state == "loading" ? _c("div", [_c("loading")], 1) : _vm._e(),
        _vm._v(" "),
        _vm.state == "success"
          ? _c("div", [
              _c(
                "div",
                {
                  staticClass:
                    "text-lg text-center h-32 flex items-center justify-center"
                },
                [
                  _c("div", [
                    _vm._v(
                      "\n          La password è stata aggiornata con successo.\n          "
                    ),
                    _c("br"),
                    _vm._v("\n          Nuova password:\n          "),
                    _c("span", { staticClass: "font-bold text-green-600" }, [
                      _vm._v(_vm._s(_vm.password))
                    ])
                  ])
                ]
              )
            ])
          : _vm._e()
      ]),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "flex flex-row px-6 py-4 bg-gray-200 items-center" },
        [
          _vm.passwordError
            ? _c(
                "div",
                { staticClass: "text-red-700 text-center flex items-center" },
                [
                  _c("icon", {
                    staticClass: "mr-1",
                    attrs: {
                      name: "exclamation-outline",
                      size: "m",
                      color: "text-red-700"
                    }
                  }),
                  _vm._v("\n      La password non è valida\n    ")
                ],
                1
              )
            : _vm._e(),
          _vm._v(" "),
          _c("div", { staticClass: "ml-auto" }, [
            _c(
              "button",
              {
                on: {
                  click: function($event) {
                    return _vm.confirm(false)
                  }
                }
              },
              [_vm._v("\n        Annulla\n      ")]
            ),
            _vm._v(" "),
            _c(
              "button",
              {
                staticClass:
                  "px-3 py-2 ml-3 text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed",
                attrs: { disabled: _vm.confirmIsDisabled },
                on: {
                  click: function($event) {
                    return _vm.forward()
                  }
                }
              },
              [_vm._v("\n        " + _vm._s(_vm.confirmText) + "\n      ")]
            )
          ])
        ]
      )
    ]
  )
};
var __vue_staticRenderFns__$6 = [];
__vue_render__$6._withStripped = true;

  /* style */
  var __vue_inject_styles__$6 = undefined;
  /* scoped */
  var __vue_scope_id__$6 = undefined;
  /* module identifier */
  var __vue_module_identifier__$6 = undefined;
  /* functional template */
  var __vue_is_functional_template__$6 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$6 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 },
    __vue_inject_styles__$6,
    __vue_script__$6,
    __vue_scope_id__$6,
    __vue_is_functional_template__$6,
    __vue_module_identifier__$6,
    false,
    undefined,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$7 = {
  name: "Confirm",
  props: {
    params: {
      required: true,
      type: Object,
      default: function default$1() {
        return {
          title: "Titolo",
          text: "Testo"
        };
      }
    }
  },
  data: function data() {
    return {
      chosenFolder: null
    };
  },
  mounted: async function mounted() {},
  methods: {
    confirm: function confirm(result) {
      this.$emit("done", result);
    }
  },
  computed: {}
};

/* script */
var __vue_script__$7 = script$7;

/* template */
var __vue_render__$7 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "flex flex-col w-1/4 bg-white rounded shadow-xl" },
    [
      _c("div", { staticClass: "flex-grow p-6 py-4" }, [
        _c("h3", { staticClass: "mb-5 text-xl font-bold text-green-600" }, [
          _vm._v(_vm._s(_vm.params.title))
        ]),
        _vm._v(" "),
        _c("p", { staticClass: "mb-3" }, [
          _vm._v("\n      " + _vm._s(_vm.params.text) + "\n    ")
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "flex flex-row p-4 bg-gray-200" }, [
        _c("div", { staticClass: "ml-auto" }, [
          _c(
            "button",
            {
              on: {
                click: function($event) {
                  return _vm.confirm(false)
                }
              }
            },
            [_vm._v("\n        " + _vm._s(_vm.params.dismissText) + "\n      ")]
          ),
          _vm._v(" "),
          _c(
            "button",
            {
              staticClass:
                "px-3 py-2 ml-3 text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed",
              on: {
                click: function($event) {
                  return _vm.confirm(true)
                }
              }
            },
            [_vm._v("\n        " + _vm._s(_vm.params.confirmText) + "\n      ")]
          )
        ])
      ])
    ]
  )
};
var __vue_staticRenderFns__$7 = [];
__vue_render__$7._withStripped = true;

  /* style */
  var __vue_inject_styles__$7 = undefined;
  /* scoped */
  var __vue_scope_id__$7 = undefined;
  /* module identifier */
  var __vue_module_identifier__$7 = undefined;
  /* functional template */
  var __vue_is_functional_template__$7 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$7 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$7, staticRenderFns: __vue_staticRenderFns__$7 },
    __vue_inject_styles__$7,
    __vue_script__$7,
    __vue_scope_id__$7,
    __vue_is_functional_template__$7,
    __vue_module_identifier__$7,
    false,
    undefined,
    undefined,
    undefined
  );

var baseModalWidgets = {
  'change-password-strong': __vue_component__$6,
  'confirm': __vue_component__$7
};

function modalWidgets (Vue, options) {
  Vue.prototype.$modalWidgets = Object.assign({}, baseModalWidgets,
    options.modalWidgets ? options.modalWidgets : {});
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$8 = {
  name: "resource-image-upload",
  props: {
    context: {
      type: Object,
      required: true
    }
  },
  data: function data() {
    return {
      extensions: ".png,.jpeg,.jpg,.gif",
      imageLoading: false,
      dragActive: false,
      dragAndDropCapable: false,
      imageSrc: null,
      isImage: false,
      image: ""
    };
  },
  mounted: function mounted() {
    this.dragAndDropCapable = this.detectDragAndDropCapable();

    if (this.dragAndDropCapable) {
      [
        "drag",
        "dragstart",
        "dragend",
        "dragover",
        "dragenter",
        "dragleave",
        "drop"
      ].forEach(
        function(evt) {
          this.$refs.fileform.addEventListener(
            evt,
            function(e) {
              e.preventDefault();
              e.stopPropagation();
            }.bind(this),
            false
          );
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "dragenter",
        function() {
          this.dragActive = true;
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "dragleave",
        function() {
          this.dragActive = false;
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "drop",
        function(e) {
          // Take only last file
          this.handleInputChange(e);
        }.bind(this)
      );
    }
  },
  methods: {
    showUploadedImage: function() {
      this.handleInputChange();
    },
    detectDragAndDropCapable: function() {
      var div = document.createElement("div");

      return (
        ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
        "FormData" in window &&
        "FileReader" in window
      );
    },
    handleImageUpload: function() {
      this.$refs.hiddenInput.click();
    },
    previewImage: function() {
      this.imageSrc = this.model || "";
      this.imageLoading = true;
      this.dragActive = false;

      var reader = new FileReader();

      reader.addEventListener(
        "load",
        function() {
          this.imageSrc = reader.result;
          this.imageLoading = false;

          this.$emit("input", this.image);
        }.bind(this),
        false
      );

      reader.readAsDataURL(this.image);
    },
    handleInputChange: function(evt) {
      var this$1 = this;

      // Check if file is OK
      this.image = null;

      var file;

      if (evt && evt.dataTransfer) {
        file = evt.dataTransfer.files[0];
      } else {
        file = this.$refs.hiddenInput.files[0];
      }

      var fileReader = new FileReader();
      var magicNumbers = file.slice(0, 4);

      function getMIMEType(magicNumberSignature) {
        switch (magicNumberSignature) {
          case "89504E47":
            return "png";

          case "47494638":
            return "gif";

          case "25504446":
            return "pdf";

          case "FFD8FFDB":
          case "FFD8FFE0":
            return "jpeg";

          case "504B0506":
          case "504B0708":
          case "504B0304":
            return "xlsx";

          default:
            return "";
        }
      }

      fileReader.onloadend = function (e) {
        if (e.target.readyState === FileReader.DONE) {
          var uint = new Uint8Array(e.target.result);

          var bytes = [];

          uint.forEach(function (byte) {
            var padded16bitInt = ("0" + byte.toString(16)).slice(-2);

            bytes.push(padded16bitInt);
          });

          var hex = bytes.join("").toUpperCase();

          var fileMIMEType = getMIMEType(hex);
          var mimeTypes = this$1.extensions
            .replace(/\./g, "")
            .replace(/ /g, "")
            .split(",");

          if (mimeTypes.indexOf(fileMIMEType) != -1) {
            this$1.image = file;
            this$1.previewImage();
          }
        }
      };

      fileReader.readAsArrayBuffer(magicNumbers);
    }
  },
  computed: {
    backgroundStyle: function backgroundStyle() {
      var imageUrl = "";

      if (this.model) {
        imageUrl = this.model;
        this.isImage = true;
      }

      if (this.value) {
        imageUrl = "/avatars/" + this.value;
        this.imageLoading = false;
        this.isImage = true;
      }

      if (this.imageSrc) {
        imageUrl = this.imageSrc;
        this.isImage = true;
      }

      return {
        "background-image": "url(" + imageUrl + ")"
      };
    },
    model: function model() {
      return this.context.model;
    },
    header: function header() {
      return this.context.attributes.header;
    },
    attributes: function attributes() {
      return this.context.attributes;
    }
  },
  watch: {
    imageSrc: function imageSrc(n, o) {
      this.context.model = n;
    }
  }
};

/* script */
var __vue_script__$8 = script$8;

/* template */
var __vue_render__$8 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "flex flex-col flex-grow items-center",
      attrs: { "data-type": _vm.context.type }
    },
    [
      _c(
        "div",
        {
          ref: "fileform",
          staticClass:
            "rounded-full w-48 h-48 border-2 border-dashed bg-gray-light flex items-center justify-center text-xl",
          class: _vm.dragActive
            ? "border-green-600 bg-green-300"
            : "border-gray",
          style: !_vm.dragActive ? _vm.backgroundStyle : "",
          on: {
            click: function($event) {
              return _vm.handleImageUpload()
            }
          }
        },
        [
          (!_vm.imageLoading && !_vm.isImage) || _vm.dragActive
            ? _c("i", {
                staticClass: "ti-image text-xl sm:text-3xl",
                class: _vm.dragActive ? "text-green-600" : "text-gray"
              })
            : _vm._e()
        ]
      ),
      _vm._v(" "),
      _c("input", {
        ref: "hiddenInput",
        staticStyle: { display: "none" },
        attrs: { type: "file", accept: "image/*" },
        on: {
          change: function($event) {
            return _vm.showUploadedImage($event)
          }
        }
      }),
      _vm._v(" "),
      _c(
        "div",
        {
          staticClass:
            "text-blue flex flex-row items-center justify-center mt-5 cursor-pointer",
          on: {
            click: function($event) {
              return _vm.handleImageUpload()
            }
          }
        },
        [
          _c("i", { staticClass: "ti-upload mr-2" }),
          _vm._v("\n    Carica immagine\n  ")
        ]
      )
    ]
  )
};
var __vue_staticRenderFns__$8 = [];
__vue_render__$8._withStripped = true;

  /* style */
  var __vue_inject_styles__$8 = function (inject) {
    if (!inject) { return }
    inject("data-v-fc399274_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"ImageUploader.vue"}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$8 = undefined;
  /* module identifier */
  var __vue_module_identifier__$8 = undefined;
  /* functional template */
  var __vue_is_functional_template__$8 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$8 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$8, staticRenderFns: __vue_staticRenderFns__$8 },
    __vue_inject_styles__$8,
    __vue_script__$8,
    __vue_scope_id__$8,
    __vue_is_functional_template__$8,
    __vue_module_identifier__$8,
    false,
    createInjector,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$9 = {
  props: {
    size: {
      type: String,
      validator: function (size) {
        return ["xs", "s", "m", "l", "xl", "2xl"].includes(size);
      },
      default: "m"
    },
    containerClass: {
      type: String,
      required: false,
      default: "flex flex-col items-center justify-center flex-grow"
    },
    fill: {
      type: String,
      required: false,
      default: 'fill-gray-800'
    }
  },
  data: function data() {
    return {
      gradientColor: "#ccc",
      sizes: {
        xs: "24",
        s: "48",
        m: "64",
        l: "72",
        xl: "96",
        "2xl": "144"
      }
    };
  }
};

/* script */
var __vue_script__$9 = script$9;

/* template */
var __vue_render__$9 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { class: _vm.containerClass },
    [
      _c("div", { staticClass: "flex flex-col items-center justify-center" }, [
        _c(
          "svg",
          {
            class: _vm.fill,
            attrs: {
              width: _vm.sizes[_vm.size],
              height: _vm.sizes[_vm.size],
              viewBox: "0 0 38 38",
              xmlns: "http://www.w3.org/2000/svg",
              fill: "#ccc"
            }
          },
          [
            _c(
              "defs",
              [
                _c(
                  "linearGradient",
                  {
                    attrs: {
                      x1: "8.042%",
                      y1: "0%",
                      x2: "65.682%",
                      y2: "23.865%",
                      id: "a"
                    }
                  },
                  [
                    _c("stop", {
                      attrs: {
                        "stop-color": _vm.gradientColor,
                        "stop-opacity": "0",
                        offset: "0%"
                      }
                    }),
                    _vm._v(" "),
                    _c("stop", {
                      attrs: {
                        "stop-color": _vm.gradientColor,
                        "stop-opacity": ".631",
                        offset: "63.146%"
                      }
                    }),
                    _vm._v(" "),
                    _c("stop", {
                      attrs: { "stop-color": _vm.gradientColor, offset: "100%" }
                    })
                  ],
                  1
                )
              ],
              1
            ),
            _vm._v(" "),
            _c("g", { attrs: { fill: "none", "fill-rule": "evenodd" } }, [
              _c("g", { attrs: { transform: "translate(1 1)" } }, [
                _c(
                  "path",
                  {
                    attrs: {
                      d: "M36 18c0-9.94-8.06-18-18-18",
                      id: "Oval-2",
                      stroke: "url(#a)",
                      "stroke-width": "2"
                    }
                  },
                  [
                    _c("animateTransform", {
                      attrs: {
                        attributeName: "transform",
                        type: "rotate",
                        from: "0 18 18",
                        to: "360 18 18",
                        dur: "0.9s",
                        repeatCount: "indefinite"
                      }
                    })
                  ],
                  1
                ),
                _vm._v(" "),
                _c(
                  "circle",
                  { attrs: { fill: "#fff", cx: "36", cy: "18", r: "1" } },
                  [
                    _c("animateTransform", {
                      attrs: {
                        attributeName: "transform",
                        type: "rotate",
                        from: "0 18 18",
                        to: "360 18 18",
                        dur: "0.9s",
                        repeatCount: "indefinite"
                      }
                    })
                  ],
                  1
                )
              ])
            ])
          ]
        )
      ]),
      _vm._v(" "),
      _vm._t("message")
    ],
    2
  )
};
var __vue_staticRenderFns__$9 = [];
__vue_render__$9._withStripped = true;

  /* style */
  var __vue_inject_styles__$9 = undefined;
  /* scoped */
  var __vue_scope_id__$9 = undefined;
  /* module identifier */
  var __vue_module_identifier__$9 = undefined;
  /* functional template */
  var __vue_is_functional_template__$9 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$9 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$9, staticRenderFns: __vue_staticRenderFns__$9 },
    __vue_inject_styles__$9,
    __vue_script__$9,
    __vue_scope_id__$9,
    __vue_is_functional_template__$9,
    __vue_module_identifier__$9,
    false,
    undefined,
    undefined,
    undefined
  );

//

var typeHasFill = {
  bar: function (fill) {
    if ( fill === void 0 ) fill = true;

    return fill;
},
  line: function (fill) {
    if ( fill === void 0 ) fill = true;

    return fill;
},
  doughnut: function (fill) {
    if ( fill === void 0 ) fill = true;

    return fill;
},
  stacked_bar: function (fill) {
    if ( fill === void 0 ) fill = true;

    return fill;
},
};

var typeConfigs = {
  line: function (show) {
    if ( show === void 0 ) show = false;

    return {
      xTicks: show,
      yTicks: show,
      yGrid: show,
      padding: function () {
        return {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        };
      },
      tickMarkLength: 0,
    };
  },
  bar: function (show) {
    if ( show === void 0 ) show = true;

    return {
      xTicks: show,
      yTicks: show,
      yGrid: show,
    };
  },
  stacked_bar: function (show) {
    if ( show === void 0 ) show = true;

    return {
      xTicks: show,
      yTicks: show,
      yGrid: show,
      stacked: show,
    };
  },
  doughnut: function (show) {
    if ( show === void 0 ) show = false;

    return {
      xTicks: show,
      yTicks: show,
      yGrid: show,
    };
  },
};

var chartType = {
  stacked_bar: "bar",
};

var script$a = {
  props: {
    type: {},
    datasets: {},
    labels: {},
    height: { required: false, default: 300 },
    width: { required: false, default: 300 },
    rim: { required: false, default: 70 },
    grid: { required: false, default: true },
    fill: { required: false, default: false },
    title: { required: false, default: null },
  },
  data: function data() {
    return {
      typeConfig: {},
      chart: null,
      ctx: null,
      sets: [],
    };
  },
  mounted: function mounted() {
    this.ctx = this.$refs.chart;

    this.loadDataSets();

    this.typeConfig = typeConfigs[this.type](this.grid);

    this.chart = new Chart(this.ctx, {
      type: chartType[this.type] || this.type,
      data: {
        labels: this.labels,
        datasets: this.sets,
      },
      options: {
        title: this.title,
        hover: {
          intersect: false,
        },
        tooltips: {
          mode: "index",
          intersect: false,
        },
        cutoutPercentage: this.rim,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        layout: {
          padding: this.typeConfig.padding,
        },
        scales: {
          yAxes: [
            {
              stacked: this.typeConfig["stacked"] || false,
              gridLines: {
                tickMarkLength:
                  this.typeConfig.tickMarkLength == undefined
                    ? 5
                    : this.typeConfig.tickMarkLength,
                display: this.typeConfig["yGrid"],
                borderDash: [6, 4],
                color: this.getColor("gray-400"),
                drawBorder: false,
                zeroLineWidth: 1,
                zeroLineColor: this.getColor("blue-700"),
              },
              ticks: {
                display: this.typeConfig["yTicks"],
                maxTicksLimit: 5,
                fontColor: this.getColor("blue-700"),
                fontStyle: 700,
                fontSize: 14,
                padding: 14,
                beginAtZero: false,
              },
            } ],
          xAxes: [
            {
              stacked: this.typeConfig["stacked"] || false,
              gridLines: {
                tickMarkLength: 0,
                display: false,
                // drawBorder: false,
                // drawOnChartArea: false,
              },
              scaleLabel: {
                display: false,
              },
              ticks: {
                display: this.typeConfig["xTicks"],
                padding: 10,
                fontSize: 14,
                fontStyle: 600,
                fontColor: this.getColor("gray-600"),
                callback: function (value, index, values) {
                  return value.toUpperCase();
                },
              },
            } ],
        },
      },
    });
  },
  methods: {
    loadDataSets: function loadDataSets(reload) {
      var this$1 = this;
      if ( reload === void 0 ) reload = false;

      this.sets = [];
      this.datasets.forEach(function (ds) {
        if (!ds.visible) {
          return;
        }

        this$1.sets.push(this$1.marshallSet(ds));
      });

      if (reload) {
        this.chart.options.animation.duration = 0;
        this.chart.data.datasets = this.sets;
        this.chart.update();
      }
    },
    marshallSet: function marshallSet(ds) {
      var gradientFill;
      switch (this.type) {
        case "line":
          gradientFill = this.ctx
            .getContext("2d")
            .createLinearGradient(0, 0, 0, 180);

          gradientFill.addColorStop(0, this.getColor(ds.color));
          gradientFill.addColorStop(1, "rgba(255,255,255,0.0)");

          return {
            label: ds.label,
            data: ds.data,
            fill: typeHasFill[this.type](this.fill) || false,
            borderColor: this.getColor(ds.color),
            // backgroundColor: "rgba(255, 255, 255, 0.0)",
            backgroundColor: gradientFill,
            borderWidth: 2,
            pointBackgroundColor: this.getColor(ds.color),
            pointHoverRadius: 5,
            pointRadius: 0,
            title: ds.title,
          };
        case "stacked_bar":
        case "bar":
          return {
            label: ds.label,
            data: ds.data,
            fill: typeHasFill[this.type](),
            borderColor: this.getColor(ds.color),
            backgroundColor: this.getColor(ds.color),
            borderWidth: 1,
            pointBackgroundColor: this.getColor(ds.color),
            pointBorderWidth: 3,
          };
        case "doughnut":
          return {
            data: ds.data,
            backgroundColor: ds.colors,
          };
      }
    },
  },
  watch: {
    datasets: {
      handler: function handler(newVal, oldVal) {
        this.loadDataSets(true);
      },
      deep: true,
    },
  },
};

/* script */
var __vue_script__$a = script$a;

/* template */
var __vue_render__$a = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "relative" }, [
    _c("canvas", {
      ref: "chart",
      style: {
        width: _vm.width + "px",
        height: _vm.height + "px"
      },
      attrs: { height: _vm.height, width: _vm.width }
    })
  ])
};
var __vue_staticRenderFns__$a = [];
__vue_render__$a._withStripped = true;

  /* style */
  var __vue_inject_styles__$a = undefined;
  /* scoped */
  var __vue_scope_id__$a = undefined;
  /* module identifier */
  var __vue_module_identifier__$a = undefined;
  /* functional template */
  var __vue_is_functional_template__$a = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$a = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$a, staticRenderFns: __vue_staticRenderFns__$a },
    __vue_inject_styles__$a,
    __vue_script__$a,
    __vue_scope_id__$a,
    __vue_is_functional_template__$a,
    __vue_module_identifier__$a,
    false,
    undefined,
    undefined,
    undefined
  );

//

function on(element, event, handler) {
  if (element && event && handler) {
    document.addEventListener
      ? element.addEventListener(event, handler, false)
      : element.attachEvent("on" + event, handler);
  }
}

function off(element, event, handler) {
  if (element && event) {
    document.removeEventListener
      ? element.removeEventListener(event, handler, false)
      : element.detachEvent("on" + event, handler);
  }
}

var script$b = {
  props: {
    toggler: {
      type: Boolean,
      default: false
    },
    tagName: {
      type: String,
      default: "span"
    },
    trigger: {
      type: String,
      default: "hover",
      validator: function (value) { return [
          "clickToOpen",
          "click", // Same as clickToToggle, provided for backwards compatibility.
          "clickToToggle",
          "hover",
          "toggler",
          "focus"
        ].indexOf(value) > -1; }
    },
    delayOnMouseOver: {
      type: Number,
      default: 10
    },
    delayOnMouseOut: {
      type: Number,
      default: 10
    },
    disabled: {
      type: Boolean,
      default: false
    },
    content: String,
    enterActiveClass: String,
    leaveActiveClass: String,
    boundariesSelector: String,
    reference: {},
    forceShow: {
      type: Boolean,
      default: false
    },
    dataValue: {
      default: null
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    visibleArrow: {
      type: Boolean,
      default: true
    },
    transition: {
      type: String,
      default: ""
    },
    stopPropagation: {
      type: Boolean,
      default: false
    },
    preventDefault: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: function default$1() {
        return {};
      }
    },
    rootClass: {
      type: String,
      default: ""
    }
  },

  data: function data() {
    return {
      referenceElm: null,
      popperJS: null,
      showPopper: false,
      currentPlacement: "",
      popperOptions: {
        placement: "bottom",
        computeStyle: {
          gpuAcceleration: false
        }
      }
    };
  },

  watch: {
    showPopper: function showPopper(value) {
      if (value) {
        this.$emit("show", this);
        if (this.popperJS) {
          this.popperJS.enableEventListeners();
        }
        this.updatePopper();
      } else {
        if (this.popperJS) {
          this.popperJS.disableEventListeners();
        }
        this.$emit("hide", this);
      }
    },

    forceShow: {
      handler: function handler(value) {
        this[value ? "doShow" : "doClose"]();
      },
      immediate: true
    },

    toggler: function toggler(value) {
      if (this.showPopper != value) {
        this.showPopper = value;
      }
    },

    disabled: function disabled(value) {
      if (value) {
        this.showPopper = false;
      }
    }
  },

  created: function created() {
    this.appendedArrow = false;
    this.appendedToBody = false;
    this.popperOptions = Object.assign(this.popperOptions, this.options);
  },

  mounted: function mounted() {
    this.referenceElm = this.reference || this.$slots.reference[0].elm;
    this.popper = this.$slots.default[0].elm;

    switch (this.trigger) {
      case "clickToOpen":
        on(this.referenceElm, "click", this.doShow);
        on(document, "click", this.handleDocumentClick);
        break;
      case "click": // Same as clickToToggle, provided for backwards compatibility.
      case "clickToToggle":
        on(this.referenceElm, "click", this.doToggle);
        on(document, "click", this.handleDocumentClick);
        break;
      case "hover":
        on(this.referenceElm, "mouseover", this.onMouseOver);
        on(this.popper, "mouseover", this.onMouseOver);
        on(this.referenceElm, "mouseout", this.onMouseOut);
        on(this.popper, "mouseout", this.onMouseOut);
        break;
      case "focus":
        on(this.referenceElm, "focus", this.onMouseOver);
        on(this.popper, "focus", this.onMouseOver);
        on(this.referenceElm, "blur", this.onMouseOut);
        on(this.popper, "blur", this.onMouseOut);
        break;
      case "toggler":
        on(document, "click", this.handleDocumentClick);
        break;
    }
  },

  destroyed: function destroyed() {
    this.destroyPopper();
  },

  methods: {
    doToggle: function doToggle(event) {
      if (this.stopPropagation) {
        event.stopPropagation();
      }

      if (this.preventDefault) {
        event.preventDefault();
      }

      if (!this.forceShow) {
        this.showPopper = !this.showPopper;
      }
    },

    doShow: function doShow() {
      this.showPopper = true;
    },

    doClose: function doClose() {
      this.showPopper = false;
    },

    doDestroy: function doDestroy() {
      if (this.showPopper) {
        return;
      }

      if (this.popperJS) {
        this.popperJS.destroy();
        this.popperJS = null;
      }

      if (this.appendedToBody) {
        this.appendedToBody = false;
        document.body.removeChild(this.popper.parentElement);
      }
    },

    createPopper: function createPopper() {
      var this$1 = this;

      this.$nextTick(function () {
        if (this$1.visibleArrow) {
          this$1.appendArrow(this$1.popper);
        }

        if (this$1.appendToBody && !this$1.appendedToBody) {
          this$1.appendedToBody = true;
          document.body.appendChild(this$1.popper.parentElement);
        }

        if (this$1.popperJS && this$1.popperJS.destroy) {
          this$1.popperJS.destroy();
        }

        if (this$1.boundariesSelector) {
          var boundariesElement = document.querySelector(
            this$1.boundariesSelector
          );

          if (boundariesElement) {
            this$1.popperOptions.modifiers = Object.assign(
              {},
              this$1.popperOptions.modifiers
            );
            this$1.popperOptions.modifiers.preventOverflow = Object.assign(
              {},
              this$1.popperOptions.modifiers.preventOverflow
            );
            this$1.popperOptions.modifiers.preventOverflow.boundariesElement = boundariesElement;
          }
        }

        this$1.popperOptions.onCreate = function () {
          this$1.$emit("created", this$1);
          this$1.$nextTick(this$1.updatePopper);
        };

        this$1.popperJS = new Popper(
          this$1.referenceElm,
          this$1.popper,
          this$1.popperOptions
        );
      });
    },

    destroyPopper: function destroyPopper() {
      off(this.referenceElm, "click", this.doToggle);
      off(this.referenceElm, "mouseup", this.doClose);
      off(this.referenceElm, "mousedown", this.doShow);
      off(this.referenceElm, "focus", this.doShow);
      off(this.referenceElm, "blur", this.doClose);
      off(this.referenceElm, "mouseout", this.onMouseOut);
      off(this.referenceElm, "mouseover", this.onMouseOver);
      off(document, "click", this.handleDocumentClick);

      this.showPopper = false;
      this.doDestroy();
    },

    appendArrow: function appendArrow(element) {
      if (this.appendedArrow) {
        return;
      }

      this.appendedArrow = true;

      var arrow = document.createElement("div");
      arrow.setAttribute("x-arrow", "");
      arrow.className = "popper__arrow";
      element.appendChild(arrow);
    },

    updatePopper: function updatePopper() {
      this.popperJS ? this.popperJS.scheduleUpdate() : this.createPopper();
    },

    onMouseOver: function onMouseOver() {
      var this$1 = this;

      clearTimeout(this._timer);
      this._timer = setTimeout(function () {
        this$1.showPopper = true;
      }, this.delayOnMouseOver);
    },

    onMouseOut: function onMouseOut() {
      var this$1 = this;

      clearTimeout(this._timer);
      this._timer = setTimeout(function () {
        this$1.showPopper = false;
      }, this.delayOnMouseOut);
    },

    handleDocumentClick: function handleDocumentClick(e) {
      // Close popper if we click inside the popper content
      if (
        !this.$el ||
        !this.referenceElm ||
        //this.elementContains(this.$el, e.target) ||
        this.elementContains(this.referenceElm, e.target) ||
        !this.popper
        // this.elementContains(this.popper, e.target)
      ) {
        return;
      }

      this.$emit("documentClick", this);

      if (this.forceShow) {
        return;
      }

      this.showPopper = false;
    },

    elementContains: function elementContains(elm, otherElm) {
      if (typeof elm.contains === "function") {
        return elm.contains(otherElm);
      }

      return false;
    }
  }
};

/* script */
var __vue_script__$b = script$b;

/* template */
var __vue_render__$b = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    _vm.tagName,
    { tag: "component" },
    [
      _c(
        "transition",
        {
          attrs: { name: _vm.transition },
          on: { "after-leave": _vm.doDestroy }
        },
        [
          _c(
            "span",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: !_vm.disabled && _vm.showPopper,
                  expression: "!disabled && showPopper"
                }
              ],
              ref: "popper",
              class: _vm.rootClass
            },
            [
              _vm._t("default", function() {
                return [_vm._v(_vm._s(_vm.content))]
              })
            ],
            2
          )
        ]
      ),
      _vm._v(" "),
      _vm._t("reference")
    ],
    2
  )
};
var __vue_staticRenderFns__$b = [];
__vue_render__$b._withStripped = true;

  /* style */
  var __vue_inject_styles__$b = function (inject) {
    if (!inject) { return }
    inject("data-v-0067301a_0", { source: "\n.popper {\n  width: auto;\n  display: inline-block;\n  position: absolute;\n  z-index: 200000;\n}\n.popper .popper__arrow {\n  width: 0;\n  height: 0;\n  border-style: solid;\n  position: absolute;\n  margin: 5px;\n}\n.popper[x-placement^=\"top\"] {\n  margin-bottom: 5px;\n}\n.popper[x-placement^=\"top\"] .popper__arrow {\n  border-width: 5px 5px 0 5px;\n  border-color: #fafafa transparent transparent transparent;\n  bottom: -5px;\n  left: calc(50% - 5px);\n  margin-top: 0;\n  margin-bottom: 0;\n}\n.popper[x-placement^=\"bottom\"] {\n  margin-top: 5px;\n}\n.popper[x-placement^=\"bottom\"] .popper__arrow {\n  border-width: 0 5px 5px 5px;\n  border-color: transparent transparent #fafafa transparent;\n  top: -5px;\n  left: calc(50% - 5px);\n  margin-top: 0;\n  margin-bottom: 0;\n}\n.popper[x-placement^=\"right\"] {\n  margin-left: 5px;\n}\n.popper[x-placement^=\"right\"] .popper__arrow {\n  border-width: 5px 5px 5px 0;\n  border-color: transparent #fafafa transparent transparent;\n  left: -5px;\n  top: calc(50% - 5px);\n  margin-left: 0;\n  margin-right: 0;\n}\n.popper[x-placement^=\"left\"] {\n  margin-right: 5px;\n}\n.popper[x-placement^=\"left\"] .popper__arrow {\n  border-width: 5px 0 5px 5px;\n  border-color: transparent transparent transparent #fafafa;\n  right: -5px;\n  top: calc(50% - 5px);\n  margin-left: 0;\n  margin-right: 0;\n}\n", map: {"version":3,"sources":["/app/estia/src/components/Popper.vue"],"names":[],"mappings":";AA4WA;EACA,WAAA;EACA,qBAAA;EACA,kBAAA;EACA,eAAA;AACA;AAEA;EACA,QAAA;EACA,SAAA;EACA,mBAAA;EACA,kBAAA;EACA,WAAA;AACA;AAEA;EACA,kBAAA;AACA;AAEA;EACA,2BAAA;EACA,yDAAA;EACA,YAAA;EACA,qBAAA;EACA,aAAA;EACA,gBAAA;AACA;AAEA;EACA,eAAA;AACA;AAEA;EACA,2BAAA;EACA,yDAAA;EACA,SAAA;EACA,qBAAA;EACA,aAAA;EACA,gBAAA;AACA;AAEA;EACA,gBAAA;AACA;AAEA;EACA,2BAAA;EACA,yDAAA;EACA,UAAA;EACA,oBAAA;EACA,cAAA;EACA,eAAA;AACA;AAEA;EACA,iBAAA;AACA;AAEA;EACA,2BAAA;EACA,yDAAA;EACA,WAAA;EACA,oBAAA;EACA,cAAA;EACA,eAAA;AACA","file":"Popper.vue","sourcesContent":["<template>\n  <component :is=\"tagName\">\n    <transition :name=\"transition\" @after-leave=\"doDestroy\">\n      <span v-show=\"!disabled && showPopper\" ref=\"popper\" :class=\"rootClass\">\n        <slot>{{ content }}</slot>\n      </span>\n    </transition>\n    <slot name=\"reference\" />\n  </component>\n</template>\n<script>\nimport Popper from \"popper.js\";\n\nfunction on(element, event, handler) {\n  if (element && event && handler) {\n    document.addEventListener\n      ? element.addEventListener(event, handler, false)\n      : element.attachEvent(\"on\" + event, handler);\n  }\n}\n\nfunction off(element, event, handler) {\n  if (element && event) {\n    document.removeEventListener\n      ? element.removeEventListener(event, handler, false)\n      : element.detachEvent(\"on\" + event, handler);\n  }\n}\n\nexport default {\n  props: {\n    toggler: {\n      type: Boolean,\n      default: false\n    },\n    tagName: {\n      type: String,\n      default: \"span\"\n    },\n    trigger: {\n      type: String,\n      default: \"hover\",\n      validator: value =>\n        [\n          \"clickToOpen\",\n          \"click\", // Same as clickToToggle, provided for backwards compatibility.\n          \"clickToToggle\",\n          \"hover\",\n          \"toggler\",\n          \"focus\"\n        ].indexOf(value) > -1\n    },\n    delayOnMouseOver: {\n      type: Number,\n      default: 10\n    },\n    delayOnMouseOut: {\n      type: Number,\n      default: 10\n    },\n    disabled: {\n      type: Boolean,\n      default: false\n    },\n    content: String,\n    enterActiveClass: String,\n    leaveActiveClass: String,\n    boundariesSelector: String,\n    reference: {},\n    forceShow: {\n      type: Boolean,\n      default: false\n    },\n    dataValue: {\n      default: null\n    },\n    appendToBody: {\n      type: Boolean,\n      default: false\n    },\n    visibleArrow: {\n      type: Boolean,\n      default: true\n    },\n    transition: {\n      type: String,\n      default: \"\"\n    },\n    stopPropagation: {\n      type: Boolean,\n      default: false\n    },\n    preventDefault: {\n      type: Boolean,\n      default: false\n    },\n    options: {\n      type: Object,\n      default() {\n        return {};\n      }\n    },\n    rootClass: {\n      type: String,\n      default: \"\"\n    }\n  },\n\n  data() {\n    return {\n      referenceElm: null,\n      popperJS: null,\n      showPopper: false,\n      currentPlacement: \"\",\n      popperOptions: {\n        placement: \"bottom\",\n        computeStyle: {\n          gpuAcceleration: false\n        }\n      }\n    };\n  },\n\n  watch: {\n    showPopper(value) {\n      if (value) {\n        this.$emit(\"show\", this);\n        if (this.popperJS) {\n          this.popperJS.enableEventListeners();\n        }\n        this.updatePopper();\n      } else {\n        if (this.popperJS) {\n          this.popperJS.disableEventListeners();\n        }\n        this.$emit(\"hide\", this);\n      }\n    },\n\n    forceShow: {\n      handler(value) {\n        this[value ? \"doShow\" : \"doClose\"]();\n      },\n      immediate: true\n    },\n\n    toggler(value) {\n      if (this.showPopper != value) {\n        this.showPopper = value;\n      }\n    },\n\n    disabled(value) {\n      if (value) {\n        this.showPopper = false;\n      }\n    }\n  },\n\n  created() {\n    this.appendedArrow = false;\n    this.appendedToBody = false;\n    this.popperOptions = Object.assign(this.popperOptions, this.options);\n  },\n\n  mounted() {\n    this.referenceElm = this.reference || this.$slots.reference[0].elm;\n    this.popper = this.$slots.default[0].elm;\n\n    switch (this.trigger) {\n      case \"clickToOpen\":\n        on(this.referenceElm, \"click\", this.doShow);\n        on(document, \"click\", this.handleDocumentClick);\n        break;\n      case \"click\": // Same as clickToToggle, provided for backwards compatibility.\n      case \"clickToToggle\":\n        on(this.referenceElm, \"click\", this.doToggle);\n        on(document, \"click\", this.handleDocumentClick);\n        break;\n      case \"hover\":\n        on(this.referenceElm, \"mouseover\", this.onMouseOver);\n        on(this.popper, \"mouseover\", this.onMouseOver);\n        on(this.referenceElm, \"mouseout\", this.onMouseOut);\n        on(this.popper, \"mouseout\", this.onMouseOut);\n        break;\n      case \"focus\":\n        on(this.referenceElm, \"focus\", this.onMouseOver);\n        on(this.popper, \"focus\", this.onMouseOver);\n        on(this.referenceElm, \"blur\", this.onMouseOut);\n        on(this.popper, \"blur\", this.onMouseOut);\n        break;\n      case \"toggler\":\n        on(document, \"click\", this.handleDocumentClick);\n        break;\n    }\n  },\n\n  destroyed() {\n    this.destroyPopper();\n  },\n\n  methods: {\n    doToggle(event) {\n      if (this.stopPropagation) {\n        event.stopPropagation();\n      }\n\n      if (this.preventDefault) {\n        event.preventDefault();\n      }\n\n      if (!this.forceShow) {\n        this.showPopper = !this.showPopper;\n      }\n    },\n\n    doShow() {\n      this.showPopper = true;\n    },\n\n    doClose() {\n      this.showPopper = false;\n    },\n\n    doDestroy() {\n      if (this.showPopper) {\n        return;\n      }\n\n      if (this.popperJS) {\n        this.popperJS.destroy();\n        this.popperJS = null;\n      }\n\n      if (this.appendedToBody) {\n        this.appendedToBody = false;\n        document.body.removeChild(this.popper.parentElement);\n      }\n    },\n\n    createPopper() {\n      this.$nextTick(() => {\n        if (this.visibleArrow) {\n          this.appendArrow(this.popper);\n        }\n\n        if (this.appendToBody && !this.appendedToBody) {\n          this.appendedToBody = true;\n          document.body.appendChild(this.popper.parentElement);\n        }\n\n        if (this.popperJS && this.popperJS.destroy) {\n          this.popperJS.destroy();\n        }\n\n        if (this.boundariesSelector) {\n          const boundariesElement = document.querySelector(\n            this.boundariesSelector\n          );\n\n          if (boundariesElement) {\n            this.popperOptions.modifiers = Object.assign(\n              {},\n              this.popperOptions.modifiers\n            );\n            this.popperOptions.modifiers.preventOverflow = Object.assign(\n              {},\n              this.popperOptions.modifiers.preventOverflow\n            );\n            this.popperOptions.modifiers.preventOverflow.boundariesElement = boundariesElement;\n          }\n        }\n\n        this.popperOptions.onCreate = () => {\n          this.$emit(\"created\", this);\n          this.$nextTick(this.updatePopper);\n        };\n\n        this.popperJS = new Popper(\n          this.referenceElm,\n          this.popper,\n          this.popperOptions\n        );\n      });\n    },\n\n    destroyPopper() {\n      off(this.referenceElm, \"click\", this.doToggle);\n      off(this.referenceElm, \"mouseup\", this.doClose);\n      off(this.referenceElm, \"mousedown\", this.doShow);\n      off(this.referenceElm, \"focus\", this.doShow);\n      off(this.referenceElm, \"blur\", this.doClose);\n      off(this.referenceElm, \"mouseout\", this.onMouseOut);\n      off(this.referenceElm, \"mouseover\", this.onMouseOver);\n      off(document, \"click\", this.handleDocumentClick);\n\n      this.showPopper = false;\n      this.doDestroy();\n    },\n\n    appendArrow(element) {\n      if (this.appendedArrow) {\n        return;\n      }\n\n      this.appendedArrow = true;\n\n      const arrow = document.createElement(\"div\");\n      arrow.setAttribute(\"x-arrow\", \"\");\n      arrow.className = \"popper__arrow\";\n      element.appendChild(arrow);\n    },\n\n    updatePopper() {\n      this.popperJS ? this.popperJS.scheduleUpdate() : this.createPopper();\n    },\n\n    onMouseOver() {\n      clearTimeout(this._timer);\n      this._timer = setTimeout(() => {\n        this.showPopper = true;\n      }, this.delayOnMouseOver);\n    },\n\n    onMouseOut() {\n      clearTimeout(this._timer);\n      this._timer = setTimeout(() => {\n        this.showPopper = false;\n      }, this.delayOnMouseOut);\n    },\n\n    handleDocumentClick(e) {\n      // Close popper if we click inside the popper content\n      if (\n        !this.$el ||\n        !this.referenceElm ||\n        //this.elementContains(this.$el, e.target) ||\n        this.elementContains(this.referenceElm, e.target) ||\n        !this.popper\n        // this.elementContains(this.popper, e.target)\n      ) {\n        return;\n      }\n\n      this.$emit(\"documentClick\", this);\n\n      if (this.forceShow) {\n        return;\n      }\n\n      this.showPopper = false;\n    },\n\n    elementContains(elm, otherElm) {\n      if (typeof elm.contains === \"function\") {\n        return elm.contains(otherElm);\n      }\n\n      return false;\n    }\n  }\n};\n</script>\n<style>\n.popper {\n  width: auto;\n  display: inline-block;\n  position: absolute;\n  z-index: 200000;\n}\n\n.popper .popper__arrow {\n  width: 0;\n  height: 0;\n  border-style: solid;\n  position: absolute;\n  margin: 5px;\n}\n\n.popper[x-placement^=\"top\"] {\n  margin-bottom: 5px;\n}\n\n.popper[x-placement^=\"top\"] .popper__arrow {\n  border-width: 5px 5px 0 5px;\n  border-color: #fafafa transparent transparent transparent;\n  bottom: -5px;\n  left: calc(50% - 5px);\n  margin-top: 0;\n  margin-bottom: 0;\n}\n\n.popper[x-placement^=\"bottom\"] {\n  margin-top: 5px;\n}\n\n.popper[x-placement^=\"bottom\"] .popper__arrow {\n  border-width: 0 5px 5px 5px;\n  border-color: transparent transparent #fafafa transparent;\n  top: -5px;\n  left: calc(50% - 5px);\n  margin-top: 0;\n  margin-bottom: 0;\n}\n\n.popper[x-placement^=\"right\"] {\n  margin-left: 5px;\n}\n\n.popper[x-placement^=\"right\"] .popper__arrow {\n  border-width: 5px 5px 5px 0;\n  border-color: transparent #fafafa transparent transparent;\n  left: -5px;\n  top: calc(50% - 5px);\n  margin-left: 0;\n  margin-right: 0;\n}\n\n.popper[x-placement^=\"left\"] {\n  margin-right: 5px;\n}\n\n.popper[x-placement^=\"left\"] .popper__arrow {\n  border-width: 5px 0 5px 5px;\n  border-color: transparent transparent transparent #fafafa;\n  right: -5px;\n  top: calc(50% - 5px);\n  margin-left: 0;\n  margin-right: 0;\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$b = undefined;
  /* module identifier */
  var __vue_module_identifier__$b = undefined;
  /* functional template */
  var __vue_is_functional_template__$b = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$b = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$b, staticRenderFns: __vue_staticRenderFns__$b },
    __vue_inject_styles__$b,
    __vue_script__$b,
    __vue_scope_id__$b,
    __vue_is_functional_template__$b,
    __vue_module_identifier__$b,
    false,
    createInjector,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$c = {
  name: "svg-icon",
  props: {
    name: { required: true, default: null },
    width: { required: true, default: "w-4" },
    height: { required: true, default: "h-4" }
  }
};

/* script */
var __vue_script__$c = script$c;

/* template */
var __vue_render__$c = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _vm.name
    ? _c("span", { class: [_vm.width, _vm.height] }, [
        _vm.name == "verified-badge"
          ? _c(
              "svg",
              {
                attrs: {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 48 48"
                }
              },
              [
                _c("polygon", {
                  attrs: {
                    fill: "#42a5f5",
                    points:
                      "29.62,3 33.053,8.308 39.367,8.624 39.686,14.937 44.997,18.367 42.116,23.995 45,29.62 39.692,33.053 39.376,39.367 33.063,39.686 29.633,44.997 24.005,42.116 18.38,45 14.947,39.692 8.633,39.376 8.314,33.063 3.003,29.633 5.884,24.005 3,18.38 8.308,14.947 8.624,8.633 14.937,8.314 18.367,3.003 23.995,5.884"
                  }
                }),
                _vm._v(" "),
                _c("polygon", {
                  attrs: {
                    fill: "#fff",
                    points:
                      "21.396,31.255 14.899,24.76 17.021,22.639 21.428,27.046 30.996,17.772 33.084,19.926"
                  }
                })
              ]
            )
          : _vm._e(),
        _vm._v(" "),
        _vm.name == "friendship-badge"
          ? _c(
              "svg",
              {
                staticStyle: { "enable-background": "new 0 0 512.003 512.003" },
                attrs: {
                  version: "1.1",
                  id: "Layer_1",
                  xmlns: "http://www.w3.org/2000/svg",
                  "xmlns:xlink": "http://www.w3.org/1999/xlink",
                  x: "0px",
                  y: "0px",
                  viewBox: "0 0 512.003 512.003",
                  "xml:space": "preserve"
                }
              },
              [
                _c("g", [
                  _c("g", [
                    _c("path", {
                      attrs: {
                        d:
                          "M509.605,171.075l-99.3-99.301c-3.193-3.194-8.37-3.194-11.565,0l-49.65,49.65c-1.533,1.533-2.394,3.613-2.394,5.782\n          c0,2.169,0.861,4.249,2.394,5.782l4.953,4.953l-11.382,11.38c-7.389,7.386-18.854,9.402-28.528,5.011\n          c-9.07-4.117-19.153-6.292-29.161-6.292c-11.883,0-23.496,2.983-33.814,8.633c-4.303-1.06-8.719-1.603-13.179-1.603\n          c-6.45,0-12.785,1.113-18.829,3.31c-9.651,3.506-19.996,1.333-27.003-5.672L171.71,132.27l2.434-2.434\n          c1.533-1.533,2.394-3.613,2.394-5.782c0-2.169-0.861-4.249-2.394-5.782l-49.65-49.65c-3.195-3.194-8.371-3.194-11.565,0\n          L2.395,179.156c-3.193,3.194-3.193,8.371,0,11.564l49.649,49.65c1.534,1.534,3.613,2.395,5.783,2.395s4.248-0.861,5.783-2.395\n          l2.961-2.961l14.414,14.414c3.637,3.637,6.048,8.178,6.971,13.131c4.786,25.683,17.086,49.032,35.57,67.526l2.715,2.715\n          c-5.214,5.491-8.082,12.645-8.082,20.245c0,7.861,3.062,15.252,8.62,20.811c5.738,5.738,13.273,8.606,20.811,8.606\n          c0.491,0,0.98-0.013,1.471-0.038c-0.398,8.019,2.458,16.17,8.568,22.282c5.559,5.559,12.95,8.62,20.811,8.62\n          c0.219,0,0.437-0.011,0.656-0.016c-0.168,7.749,2.691,15.552,8.591,21.453c5.559,5.56,12.95,8.62,20.812,8.62\n          c7.861,0,15.251-3.062,20.811-8.62c0.468-0.468,0.909-0.952,1.34-1.442c2.895,1.009,5.957,1.546,9.052,1.546\n          c7.353,0,14.261-2.865,19.441-8.062c2.757-2.756,4.849-5.998,6.211-9.529l0.837,0.837c5.359,5.359,12.398,8.039,19.437,8.039\n          c7.039,0,14.078-2.68,19.437-8.039c2.848-2.848,4.988-6.211,6.344-9.878c4.797,3.489,10.476,5.236,16.158,5.236\n          c7.039,0,14.082-2.679,19.446-8.036c5.191-5.191,8.05-12.097,8.05-19.445c0-2.22-0.266-4.397-0.773-6.502\n          c5.237-1.064,10.049-3.635,13.91-7.501c5.191-5.191,8.05-12.094,8.05-19.437c0-5.785-1.782-11.292-5.073-15.91l6.56-6.56\n          c18.699-18.708,31.052-42.35,35.725-68.371c0.783-4.357,2.941-8.404,6.243-11.707l24.398-24.398l4.289,4.289\n          c1.597,1.597,3.69,2.395,5.783,2.395c2.092,0,4.186-0.798,5.783-2.395l49.65-49.65c1.533-1.533,2.394-3.613,2.394-5.782\n          S511.138,172.609,509.605,171.075z M57.827,223.025l-38.086-38.086L118.71,85.97l38.087,38.086L57.827,223.025z M156.836,364.689\n          c-5.097,5.096-13.392,5.098-18.493,0c-2.47-2.471-3.83-5.754-3.83-9.247c0-3.492,1.361-6.776,3.831-9.246\n          c2.549-2.549,5.896-3.824,9.245-3.824c3.348,0,6.698,1.275,9.246,3.824C161.933,351.294,161.933,359.59,156.836,364.689z\n          M187.684,395.537c-2.468,2.471-5.751,3.83-9.246,3.83c-3.492,0-6.776-1.361-9.245-3.83c-5.099-5.098-5.099-13.394,0-18.493\n          c2.549-2.549,5.896-3.824,9.246-3.824c3.347,0,6.697,1.275,9.245,3.824C192.784,382.142,192.784,390.439,187.684,395.537z\n          M217.742,425.594c-2.47,2.47-5.753,3.83-9.245,3.83c-3.493,0-6.777-1.361-9.246-3.83c-5.099-5.098-5.099-13.394,0-18.493\n          c2.549-2.549,5.896-3.824,9.246-3.824c3.347,0,6.697,1.275,9.245,3.824C222.841,412.2,222.841,420.496,217.742,425.594z\n          M356.63,362.822c-2.102,2.104-4.897,3.263-7.869,3.263s-5.767-1.159-7.873-3.268l-79.33-79.312\n          c-3.196-3.193-8.372-3.192-11.565,0.002c-3.192,3.193-3.191,8.371,0.002,11.564l85.451,85.442c2.103,2.102,3.26,4.898,3.26,7.872\n          c0,2.98-1.158,5.779-3.257,7.878c-4.347,4.343-11.416,4.344-15.756,0.003l-14.416-14.416c-0.08-0.083-0.158-0.167-0.241-0.249\n          c-0.024-0.024-0.051-0.045-0.076-0.069l-66.267-66.267c-3.195-3.193-8.371-3.193-11.565,0c-3.194,3.193-3.194,8.371,0,11.564\n          l66.48,66.479c2.032,2.083,3.151,4.839,3.151,7.763c0,2.974-1.159,5.77-3.261,7.872c-4.338,4.341-11.401,4.341-15.743,0\n          l-72.085-72.086c-3.195-3.194-8.371-3.194-11.565,0c-3.194,3.193-3.194,8.371,0,11.564l53.434,53.435\n          c0.015,0.015,0.027,0.032,0.043,0.046c2.101,2.097,3.257,4.888,3.257,7.859c0,2.973-1.158,5.769-3.269,7.88\n          c-2.099,2.104-4.893,3.263-7.87,3.263c-0.719,0-1.422-0.074-2.11-0.204c1.323-8.913-1.436-18.32-8.282-25.167\n          c-5.559-5.558-12.95-8.62-20.811-8.62c-0.219,0-0.437,0.011-0.656,0.016c0.168-7.749-2.69-15.552-8.591-21.453\n          c-5.56-5.558-12.95-8.62-20.812-8.62c-0.492,0-0.981,0.012-1.469,0.036c0.393-8.014-2.463-16.158-8.57-22.266\n          c-7.434-7.433-17.884-10.044-27.444-7.847l-5.864-5.864c-16.14-16.147-26.878-36.535-31.057-58.96\n          c-1.531-8.213-5.502-15.717-11.483-21.699l-14.415-14.415l82.01-82.01l20.438,20.438c7.856,7.856,18.552,12.06,29.507,12.06\n          c4.906,0,9.867-0.844,14.646-2.581c2.318-0.843,4.715-1.448,7.144-1.832l-50.632,50.633c-6.195,6.194-9.607,14.43-9.607,23.191\n          c0,8.76,3.412,16.996,9.606,23.19c6.394,6.394,14.79,9.59,23.19,9.589c8.398,0,16.797-3.198,23.192-9.589l25.43-25.43l6.883,6.888\n          c0.002,0.002,0.003,0.003,0.005,0.005l0.286,0.286l0.275,0.275c0.001,0.001,0.003,0.003,0.005,0.004l0.005,0.005\n          c0.079,0.078,0.156,0.152,0.233,0.226l95.881,95.881c2.103,2.102,3.26,4.898,3.26,7.872\n          C359.893,357.921,358.736,360.717,356.63,362.822z M408.137,240.834c-5.674,5.675-9.4,12.723-10.774,20.381\n          c-4.08,22.72-14.867,43.364-31.193,59.698l-6.284,6.285l-51.731-51.731c1.124,0.083,2.253,0.138,3.39,0.138\n          c5.238,0,10.598-0.918,15.934-3.101c4.18-1.71,6.182-6.485,4.472-10.664c-1.71-4.179-6.481-6.182-10.664-4.472\n          c-21.046,8.611-46.278-15.12-49.087-17.855c-0.047-0.046-0.094-0.091-0.142-0.135l-0.29-0.29\n          c-0.001-0.001-0.002-0.001-0.003-0.002l-0.253-0.252c-0.001-0.001-0.003-0.003-0.005-0.004l-6.884-6.889l7.806-7.807\n          c3.195-3.194,3.195-8.371,0.001-11.565c-3.194-3.192-8.371-3.193-11.564,0l-13.57,13.57c-0.005,0.005-0.011,0.01-0.016,0.015\n          c-0.005,0.005-0.01,0.011-0.015,0.016l-31.2,31.2c-6.412,6.411-16.842,6.409-23.252,0c-3.105-3.105-4.815-7.234-4.815-11.626\n          c0-4.392,1.71-8.521,4.816-11.626l53.852-53.854c2.996-2.995,6.326-5.63,9.905-7.837c8.503-5.256,18.324-8.034,28.401-8.034\n          c7.693,0,15.439,1.67,22.403,4.831c15.842,7.188,34.671,3.839,46.851-8.338l11.383-11.381l66.929,66.929L408.137,240.834z\n          M454.172,214.944l-87.736-87.736l38.087-38.086l87.736,87.736L454.172,214.944z"
                      }
                    })
                  ])
                ]),
                _vm._v(" "),
                _c("g", [
                  _c("g", [
                    _c("circle", {
                      attrs: { cx: "462.41", cy: "183.11", r: "8.177" }
                    })
                  ])
                ]),
                _vm._v(" "),
                _c("g", [
                  _c("g", [
                    _c("circle", {
                      attrs: { cx: "53.567", cy: "191.189", r: "8.177" }
                    })
                  ])
                ])
              ]
            )
          : _vm._e(),
        _vm._v(" "),
        _vm.name == "ig-logo"
          ? _c(
              "svg",
              {
                attrs: {
                  fill: "#000000",
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 80 80",
                  width: "80px",
                  height: "80px"
                }
              },
              [
                _c("path", {
                  attrs: {
                    d:
                      "M 26.816406 9 C 17.542969 9 10 16.542969 10 25.816406 L 10 52.183594 C 10 61.457031 17.542969 69 26.816406 69 L 53.183594 69 C 62.457031 69 70 61.457031 70 52.183594 L 70 25.816406 C 70 16.542969 62.457031 9 53.183594 9 Z M 26.816406 11 L 53.183594 11 C 61.375 11 68 17.625 68 25.816406 L 68 52.183594 C 68 60.375 61.375 67 53.183594 67 L 26.816406 67 C 18.625 67 12 60.375 12 52.183594 L 12 25.816406 C 12 17.625 18.625 11 26.816406 11 Z M 58 19.5 C 56.621094 19.5 55.5 20.621094 55.5 22 C 55.5 23.378906 56.621094 24.5 58 24.5 C 59.378906 24.5 60.5 23.378906 60.5 22 C 60.5 20.621094 59.378906 19.5 58 19.5 Z M 40 22 C 30.621094 22 23 29.621094 23 39 C 23 48.378906 30.621094 56 40 56 C 49.378906 56 57 48.378906 57 39 C 57 29.621094 49.378906 22 40 22 Z M 40 24 C 48.296875 24 55 30.703125 55 39 C 55 47.296875 48.296875 54 40 54 C 31.703125 54 25 47.296875 25 39 C 25 30.703125 31.703125 24 40 24 Z M 40 27 C 39.449219 27 39 27.449219 39 28 C 39 28.550781 39.449219 29 40 29 C 40.550781 29 41 28.550781 41 28 C 41 27.449219 40.550781 27 40 27 Z M 35.796875 27.835938 C 35.664063 27.835938 35.53125 27.859375 35.40625 27.910156 C 34.898438 28.125 34.65625 28.707031 34.867188 29.21875 C 35.078125 29.730469 35.664063 29.972656 36.171875 29.761719 C 36.683594 29.546875 36.925781 28.964844 36.714844 28.453125 C 36.5625 28.082031 36.199219 27.839844 35.796875 27.835938 Z M 44.230469 27.835938 C 43.816406 27.828125 43.441406 28.070313 43.285156 28.453125 C 43.074219 28.964844 43.316406 29.546875 43.828125 29.761719 C 44.335938 29.972656 44.921875 29.730469 45.132813 29.21875 C 45.34375 28.707031 45.101563 28.125 44.59375 27.910156 C 44.476563 27.863281 44.355469 27.839844 44.230469 27.835938 Z M 32.234375 30.222656 C 31.964844 30.21875 31.707031 30.324219 31.515625 30.515625 C 31.125 30.90625 31.125 31.539063 31.515625 31.929688 C 31.90625 32.320313 32.539063 32.320313 32.929688 31.929688 C 33.320313 31.539063 33.320313 30.90625 32.929688 30.515625 C 32.746094 30.332031 32.496094 30.226563 32.234375 30.222656 Z M 47.792969 30.222656 C 47.519531 30.21875 47.261719 30.324219 47.070313 30.515625 C 46.679688 30.90625 46.679688 31.539063 47.070313 31.929688 C 47.460938 32.320313 48.09375 32.320313 48.484375 31.929688 C 48.875 31.539063 48.875 30.90625 48.484375 30.515625 C 48.300781 30.332031 48.050781 30.226563 47.792969 30.222656 Z M 50.171875 33.789063 C 50.035156 33.789063 49.902344 33.8125 49.78125 33.863281 C 49.269531 34.078125 49.027344 34.660156 49.238281 35.171875 C 49.449219 35.683594 50.035156 35.925781 50.546875 35.714844 C 51.054688 35.5 51.296875 34.917969 51.085938 34.40625 C 50.933594 34.035156 50.570313 33.792969 50.171875 33.789063 Z M 29.859375 33.792969 C 29.445313 33.78125 29.070313 34.027344 28.914063 34.40625 C 28.703125 34.917969 28.945313 35.503906 29.453125 35.714844 C 29.699219 35.816406 29.976563 35.816406 30.222656 35.714844 C 30.464844 35.613281 30.660156 35.417969 30.761719 35.171875 C 30.863281 34.925781 30.863281 34.652344 30.761719 34.40625 C 30.660156 34.160156 30.464844 33.964844 30.21875 33.863281 C 30.105469 33.820313 29.984375 33.792969 29.859375 33.792969 Z M 29 38 C 28.449219 38 28 38.449219 28 39 C 28 39.550781 28.449219 40 29 40 C 29.550781 40 30 39.550781 30 39 C 30 38.449219 29.550781 38 29 38 Z M 51 38 C 50.449219 38 50 38.449219 50 39 C 50 39.550781 50.449219 40 51 40 C 51.550781 40 52 39.550781 52 39 C 52 38.449219 51.550781 38 51 38 Z M 29.84375 42.207031 C 29.710938 42.207031 29.578125 42.234375 29.453125 42.285156 C 28.945313 42.496094 28.703125 43.082031 28.914063 43.59375 C 29.125 44.101563 29.710938 44.34375 30.21875 44.132813 C 30.730469 43.921875 30.972656 43.335938 30.761719 42.828125 C 30.609375 42.457031 30.246094 42.210938 29.84375 42.207031 Z M 50.1875 42.207031 C 49.773438 42.199219 49.398438 42.445313 49.238281 42.824219 C 49.027344 43.335938 49.269531 43.917969 49.78125 44.128906 C 50.292969 44.34375 50.875 44.101563 51.089844 43.589844 C 51.300781 43.078125 51.058594 42.496094 50.546875 42.28125 C 50.433594 42.234375 50.308594 42.210938 50.1875 42.207031 Z M 32.234375 45.777344 C 31.964844 45.773438 31.703125 45.878906 31.515625 46.070313 C 31.125 46.460938 31.125 47.09375 31.515625 47.484375 C 31.902344 47.875 32.539063 47.875 32.925781 47.484375 C 33.316406 47.09375 33.316406 46.460938 32.925781 46.070313 C 32.742188 45.886719 32.496094 45.78125 32.234375 45.777344 Z M 47.792969 45.78125 C 47.519531 45.773438 47.261719 45.878906 47.070313 46.070313 C 46.882813 46.257813 46.777344 46.511719 46.777344 46.777344 C 46.777344 47.042969 46.882813 47.296875 47.070313 47.484375 C 47.460938 47.875 48.09375 47.875 48.484375 47.484375 C 48.671875 47.296875 48.777344 47.042969 48.777344 46.777344 C 48.777344 46.511719 48.671875 46.257813 48.484375 46.070313 C 48.300781 45.886719 48.050781 45.78125 47.792969 45.78125 Z M 35.8125 48.160156 C 35.398438 48.152344 35.023438 48.398438 34.867188 48.78125 C 34.65625 49.289063 34.898438 49.875 35.40625 50.085938 C 35.917969 50.296875 36.503906 50.054688 36.714844 49.546875 C 36.925781 49.035156 36.683594 48.449219 36.171875 48.238281 C 36.058594 48.191406 35.9375 48.164063 35.8125 48.160156 Z M 44.21875 48.160156 C 44.085938 48.160156 43.953125 48.1875 43.828125 48.238281 C 43.316406 48.449219 43.074219 49.035156 43.285156 49.546875 C 43.5 50.054688 44.082031 50.296875 44.59375 50.085938 C 45.105469 49.875 45.347656 49.289063 45.136719 48.78125 C 44.980469 48.410156 44.621094 48.164063 44.21875 48.160156 Z M 40 49 C 39.449219 49 39 49.449219 39 50 C 39 50.550781 39.449219 51 40 51 C 40.550781 51 41 50.550781 41 50 C 41 49.449219 40.550781 49 40 49 Z"
                  }
                })
              ]
            )
          : _vm._e(),
        _vm._v(" "),
        _vm.name == "no-data"
          ? _c(
              "svg",
              {
                class: [_vm.width, _vm.height],
                attrs: {
                  id: "f20e0c25-d928-42cc-98d1-13cc230663ea",
                  "data-name": "Layer 1",
                  xmlns: "http://www.w3.org/2000/svg",
                  "xmlns:xlink": "http://www.w3.org/1999/xlink",
                  viewBox: "0 0 820.16 780.81"
                }
              },
              [
                _c(
                  "defs",
                  [
                    _c(
                      "linearGradient",
                      {
                        attrs: {
                          id: "07332201-7176-49c2-9908-6dc4a39c4716",
                          x1: "539.63",
                          y1: "734.6",
                          x2: "539.63",
                          y2: "151.19",
                          gradientTransform: "translate(-3.62 1.57)",
                          gradientUnits: "userSpaceOnUse"
                        }
                      },
                      [
                        _c("stop", {
                          attrs: {
                            offset: "0",
                            "stop-color": "gray",
                            "stop-opacity": "0.25"
                          }
                        }),
                        _vm._v(" "),
                        _c("stop", {
                          attrs: {
                            offset: "0.54",
                            "stop-color": "gray",
                            "stop-opacity": "0.12"
                          }
                        }),
                        _vm._v(" "),
                        _c("stop", {
                          attrs: {
                            offset: "1",
                            "stop-color": "gray",
                            "stop-opacity": "0.1"
                          }
                        })
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _c("linearGradient", {
                      attrs: {
                        id: "0ee1ab3f-7ba2-4205-9d4a-9606ad702253",
                        x1: "540.17",
                        y1: "180.2",
                        x2: "540.17",
                        y2: "130.75",
                        gradientTransform: "translate(-63.92 7.85)",
                        "xlink:href": "#07332201-7176-49c2-9908-6dc4a39c4716"
                      }
                    }),
                    _vm._v(" "),
                    _c("linearGradient", {
                      attrs: {
                        id: "abca9755-bed1-4a97-b027-7f02ee3ffa09",
                        x1: "540.17",
                        y1: "140.86",
                        x2: "540.17",
                        y2: "82.43",
                        gradientTransform:
                          "translate(-84.51 124.6) rotate(-12.11)",
                        "xlink:href": "#07332201-7176-49c2-9908-6dc4a39c4716"
                      }
                    }),
                    _vm._v(" "),
                    _c("linearGradient", {
                      attrs: {
                        id: "2632d424-e666-4ee4-9508-a494957e14ab",
                        x1: "476.4",
                        y1: "710.53",
                        x2: "476.4",
                        y2: "127.12",
                        gradientTransform: "matrix(1, 0, 0, 1, 0, 0)",
                        "xlink:href": "#07332201-7176-49c2-9908-6dc4a39c4716"
                      }
                    }),
                    _vm._v(" "),
                    _c("linearGradient", {
                      attrs: {
                        id: "97571ef7-1c83-4e06-b701-c2e47e77dca3",
                        x1: "476.94",
                        y1: "156.13",
                        x2: "476.94",
                        y2: "106.68",
                        gradientTransform: "matrix(1, 0, 0, 1, 0, 0)",
                        "xlink:href": "#07332201-7176-49c2-9908-6dc4a39c4716"
                      }
                    }),
                    _vm._v(" "),
                    _c("linearGradient", {
                      attrs: {
                        id: "7d32e13e-a0c7-49c4-af0e-066a2f8cb76e",
                        x1: "666.86",
                        y1: "176.39",
                        x2: "666.86",
                        y2: "117.95",
                        gradientTransform: "matrix(1, 0, 0, 1, 0, 0)",
                        "xlink:href": "#07332201-7176-49c2-9908-6dc4a39c4716"
                      }
                    })
                  ],
                  1
                ),
                _vm._v(" "),
                _c("title", [_vm._v("no data")]),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "317.5",
                    y: "142.55",
                    width: "437.02",
                    height: "603.82",
                    transform: "translate(-271.22 62.72) rotate(-12.11)",
                    fill: "#e0e0e0"
                  }
                }),
                _vm._v(" "),
                _c("g", { attrs: { opacity: "0.5" } }, [
                  _c("rect", {
                    attrs: {
                      x: "324.89",
                      y: "152.76",
                      width: "422.25",
                      height: "583.41",
                      transform: "translate(-271.22 62.72) rotate(-12.11)",
                      fill: "url(#07332201-7176-49c2-9908-6dc4a39c4716)"
                    }
                  })
                ]),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "329.81",
                    y: "157.1",
                    width: "411.5",
                    height: "570.52",
                    transform: "translate(-270.79 62.58) rotate(-12.11)",
                    fill: "#fafafa"
                  }
                }),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "374.18",
                    y: "138.6",
                    width: "204.14",
                    height: "49.45",
                    transform: "translate(-213.58 43.93) rotate(-12.11)",
                    fill: "url(#0ee1ab3f-7ba2-4205-9d4a-9606ad702253)"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M460.93,91.9c-15.41,3.31-25.16,18.78-21.77,34.55s18.62,25.89,34,22.58,25.16-18.78,21.77-34.55S476.34,88.59,460.93,91.9ZM470.6,137A16.86,16.86,0,1,1,483.16,117,16.66,16.66,0,0,1,470.6,137Z",
                    transform: "translate(-189.92 -59.59)",
                    fill: "url(#abca9755-bed1-4a97-b027-7f02ee3ffa09)"
                  }
                }),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "375.66",
                    y: "136.55",
                    width: "199.84",
                    height: "47.27",
                    transform: "translate(-212.94 43.72) rotate(-12.11)",
                    fill: "#6c63ff"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M460.93,91.9a27.93,27.93,0,1,0,33.17,21.45A27.93,27.93,0,0,0,460.93,91.9ZM470.17,135a16.12,16.12,0,1,1,12.38-19.14A16.12,16.12,0,0,1,470.17,135Z",
                    transform: "translate(-189.92 -59.59)",
                    fill: "#6c63ff"
                  }
                }),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "257.89",
                    y: "116.91",
                    width: "437.02",
                    height: "603.82",
                    fill: "#e0e0e0"
                  }
                }),
                _vm._v(" "),
                _c("g", { attrs: { opacity: "0.5" } }, [
                  _c("rect", {
                    attrs: {
                      x: "265.28",
                      y: "127.12",
                      width: "422.25",
                      height: "583.41",
                      fill: "url(#2632d424-e666-4ee4-9508-a494957e14ab)"
                    }
                  })
                ]),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "270.65",
                    y: "131.42",
                    width: "411.5",
                    height: "570.52",
                    fill: "#fff"
                  }
                }),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "374.87",
                    y: "106.68",
                    width: "204.14",
                    height: "49.45",
                    fill: "url(#97571ef7-1c83-4e06-b701-c2e47e77dca3)"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M666.86,118c-15.76,0-28.54,13.08-28.54,29.22s12.78,29.22,28.54,29.22,28.54-13.08,28.54-29.22S682.62,118,666.86,118Zm0,46.08a16.86,16.86,0,1,1,16.46-16.86A16.66,16.66,0,0,1,666.86,164Z",
                    transform: "translate(-189.92 -59.59)",
                    fill: "url(#7d32e13e-a0c7-49c4-af0e-066a2f8cb76e)"
                  }
                }),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "377.02",
                    y: "104.56",
                    width: "199.84",
                    height: "47.27",
                    fill: "#6c63ff"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M666.86,118a27.93,27.93,0,1,0,27.93,27.93A27.93,27.93,0,0,0,666.86,118Zm0,44.05A16.12,16.12,0,1,1,683,145.89,16.12,16.12,0,0,1,666.86,162Z",
                    transform: "translate(-189.92 -59.59)",
                    fill: "#6c63ff"
                  }
                }),
                _vm._v(" "),
                _c("g", { attrs: { opacity: "0.5" } }, [
                  _c("rect", {
                    attrs: {
                      x: "15.27",
                      y: "737.05",
                      width: "3.76",
                      height: "21.33",
                      fill: "#47e6b1"
                    }
                  }),
                  _vm._v(" "),
                  _c("rect", {
                    attrs: {
                      x: "205.19",
                      y: "796.65",
                      width: "3.76",
                      height: "21.33",
                      transform: "translate(824.47 540.65) rotate(90)",
                      fill: "#47e6b1"
                    }
                  })
                ]),
                _vm._v(" "),
                _c("g", { attrs: { opacity: "0.5" } }, [
                  _c("rect", {
                    attrs: {
                      x: "451.49",
                      width: "3.76",
                      height: "21.33",
                      fill: "#47e6b1"
                    }
                  }),
                  _vm._v(" "),
                  _c("rect", {
                    attrs: {
                      x: "641.4",
                      y: "59.59",
                      width: "3.76",
                      height: "21.33",
                      transform: "translate(523.63 -632.62) rotate(90)",
                      fill: "#47e6b1"
                    }
                  })
                ]),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M961,832.15a4.61,4.61,0,0,1-2.57-5.57,2.22,2.22,0,0,0,.1-.51h0a2.31,2.31,0,0,0-4.15-1.53h0a2.22,2.22,0,0,0-.26.45,4.61,4.61,0,0,1-5.57,2.57,2.22,2.22,0,0,0-.51-.1h0a2.31,2.31,0,0,0-1.53,4.15h0a2.22,2.22,0,0,0,.45.26,4.61,4.61,0,0,1,2.57,5.57,2.22,2.22,0,0,0-.1.51h0a2.31,2.31,0,0,0,4.15,1.53h0a2.22,2.22,0,0,0,.26-.45,4.61,4.61,0,0,1,5.57-2.57,2.22,2.22,0,0,0,.51.1h0a2.31,2.31,0,0,0,1.53-4.15h0A2.22,2.22,0,0,0,961,832.15Z",
                    transform: "translate(-189.92 -59.59)",
                    fill: "#4d8af0",
                    opacity: "0.5"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M326.59,627.09a4.61,4.61,0,0,1-2.57-5.57,2.22,2.22,0,0,0,.1-.51h0a2.31,2.31,0,0,0-4.15-1.53h0a2.22,2.22,0,0,0-.26.45,4.61,4.61,0,0,1-5.57,2.57,2.22,2.22,0,0,0-.51-.1h0a2.31,2.31,0,0,0-1.53,4.15h0a2.22,2.22,0,0,0,.45.26,4.61,4.61,0,0,1,2.57,5.57,2.22,2.22,0,0,0-.1.51h0a2.31,2.31,0,0,0,4.15,1.53h0a2.22,2.22,0,0,0,.26-.45A4.61,4.61,0,0,1,325,631.4a2.22,2.22,0,0,0,.51.1h0a2.31,2.31,0,0,0,1.53-4.15h0A2.22,2.22,0,0,0,326.59,627.09Z",
                    transform: "translate(-189.92 -59.59)",
                    fill: "#fdd835",
                    opacity: "0.5"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M855,127.77a4.61,4.61,0,0,1-2.57-5.57,2.22,2.22,0,0,0,.1-.51h0a2.31,2.31,0,0,0-4.15-1.53h0a2.22,2.22,0,0,0-.26.45,4.61,4.61,0,0,1-5.57,2.57,2.22,2.22,0,0,0-.51-.1h0a2.31,2.31,0,0,0-1.53,4.15h0a2.22,2.22,0,0,0,.45.26,4.61,4.61,0,0,1,2.57,5.57,2.22,2.22,0,0,0-.1.51h0a2.31,2.31,0,0,0,4.15,1.53h0a2.22,2.22,0,0,0,.26-.45,4.61,4.61,0,0,1,5.57-2.57,2.22,2.22,0,0,0,.51.1h0a2.31,2.31,0,0,0,1.53-4.15h0A2.22,2.22,0,0,0,855,127.77Z",
                    transform: "translate(-189.92 -59.59)",
                    fill: "#fdd835",
                    opacity: "0.5"
                  }
                }),
                _vm._v(" "),
                _c("circle", {
                  attrs: {
                    cx: "812.64",
                    cy: "314.47",
                    r: "7.53",
                    fill: "#f55f44",
                    opacity: "0.5"
                  }
                }),
                _vm._v(" "),
                _c("circle", {
                  attrs: {
                    cx: "230.73",
                    cy: "746.65",
                    r: "7.53",
                    fill: "#f55f44",
                    opacity: "0.5"
                  }
                }),
                _vm._v(" "),
                _c("circle", {
                  attrs: {
                    cx: "735.31",
                    cy: "477.23",
                    r: "7.53",
                    fill: "#f55f44",
                    opacity: "0.5"
                  }
                }),
                _vm._v(" "),
                _c("circle", {
                  attrs: {
                    cx: "87.14",
                    cy: "96.35",
                    r: "7.53",
                    fill: "#4d8af0",
                    opacity: "0.5"
                  }
                }),
                _vm._v(" "),
                _c("circle", {
                  attrs: {
                    cx: "7.53",
                    cy: "301.76",
                    r: "7.53",
                    fill: "#47e6b1",
                    opacity: "0.5"
                  }
                })
              ]
            )
          : _vm._e(),
        _vm._v(" "),
        _vm.name == "error"
          ? _c(
              "svg",
              {
                class: [_vm.width, _vm.height],
                attrs: {
                  "data-name": "Layer 1",
                  xmlns: "http://www.w3.org/2000/svg",
                  "xmlns:xlink": "http://www.w3.org/1999/xlink",
                  viewBox: "0 0 1022.7 785.81"
                }
              },
              [
                _c(
                  "defs",
                  [
                    _c(
                      "linearGradient",
                      {
                        attrs: {
                          id: "af83dc26-9572-4816-b7a1-1af4f72ff554",
                          x1: "678.2",
                          y1: "821.79",
                          x2: "678.2",
                          y2: "493.4",
                          gradientTransform:
                            "translate(-20.24 29.65) rotate(-2.31)",
                          gradientUnits: "userSpaceOnUse"
                        }
                      },
                      [
                        _c("stop", {
                          attrs: {
                            offset: "0",
                            "stop-color": "gray",
                            "stop-opacity": "0.25"
                          }
                        }),
                        _vm._v(" "),
                        _c("stop", {
                          attrs: {
                            offset: "0.54",
                            "stop-color": "gray",
                            "stop-opacity": "0.12"
                          }
                        }),
                        _vm._v(" "),
                        _c("stop", {
                          attrs: {
                            offset: "1",
                            "stop-color": "gray",
                            "stop-opacity": "0.1"
                          }
                        })
                      ],
                      1
                    )
                  ],
                  1
                ),
                _vm._v(" "),
                _c("title", [_vm._v("bug fixing")]),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "468.63",
                    cy: "660.88",
                    rx: "425",
                    ry: "33",
                    fill: "#6c63ff",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("g", { attrs: { opacity: "0.1" } }, [
                  _c("path", {
                    attrs: {
                      d:
                        "M933.7,529.93c-2.54-7.71-12.84-11.26-23-7.92a24.76,24.76,0,0,0-4.23,1.83c-.65-.18-1.32-.34-2-.46a22.42,22.42,0,0,0,.63-6.79A24.6,24.6,0,0,0,916,495.12a24.63,24.63,0,0,0,10.86-21.47,23.76,23.76,0,0,0,8.23-9.32c4.9-9.7,2.87-20.6-4.54-24.35s-17.4,1.08-22.3,10.78a23.69,23.69,0,0,0-2.63,12.15,24.63,24.63,0,0,0-10.86,21.47,24.63,24.63,0,0,0-10.86,21.47A24.64,24.64,0,0,0,873,527.33a23.76,23.76,0,0,0-8.23,9.32,25.46,25.46,0,0,0-2.08,5.74,21.18,21.18,0,0,0-4.44-4.73,25.38,25.38,0,0,0-1-4.5c-3.34-10.17-12.3-16.37-20-13.83s-11.26,12.83-7.92,23a23.07,23.07,0,0,0,7.56,11.08,25.38,25.38,0,0,0,1,4.5c1.94,5.9,5.77,10.46,10.15,12.75a23.23,23.23,0,0,0-.83,3.9,25.29,25.29,0,0,0-7.54,14.91,25.27,25.27,0,0,0-7.54,14.92,24.63,24.63,0,0,0-5,6.81c-4.91,9.7-2.88,20.61,4.53,24.35s17.4-1.07,22.31-10.78a24.62,24.62,0,0,0,2.5-8.09,25.29,25.29,0,0,0,7.54-14.91,25.27,25.27,0,0,0,7.54-14.92A25.21,25.21,0,0,0,879,571.94,25.21,25.21,0,0,0,886.56,557a24.11,24.11,0,0,0,3.39-4,23.46,23.46,0,0,0,12.27-.77,24.76,24.76,0,0,0,4.23-1.83,23.2,23.2,0,0,0,13.42-.48C930,546.61,936.23,537.65,933.7,529.93Z",
                      transform: "translate(-88.65 -57.09)",
                      fill: "#3f3d56"
                    }
                  }),
                  _vm._v(" "),
                  _c("g", { attrs: { opacity: "0.1" } }, [
                    _c("path", {
                      attrs: {
                        d:
                          "M915.77,499.53a21.5,21.5,0,0,1-3.44,2.75,23,23,0,0,1-1.11,8.43,26.18,26.18,0,0,0,2.1-3.43A24.64,24.64,0,0,0,915.77,499.53Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M926.63,478.06a21.5,21.5,0,0,1-3.44,2.75,23,23,0,0,1-1.11,8.43,25.65,25.65,0,0,0,2.1-3.44A24.85,24.85,0,0,0,926.63,478.06Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M902,470.07a21.91,21.91,0,0,1,.17-4.41,24.93,24.93,0,0,0-4.78,6.57,25.63,25.63,0,0,0-1.52,3.73A22.75,22.75,0,0,1,902,470.07Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M833.07,600a23.59,23.59,0,0,1,2.95-3.38,22.92,22.92,0,0,1,.87-4,25.09,25.09,0,0,0-2.29,3.71A25.59,25.59,0,0,0,833.07,600Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M840.61,585.1a23.59,23.59,0,0,1,2.95-3.38,23,23,0,0,1,.83-3.9l0,0a25.68,25.68,0,0,0-2.2,3.59A26.76,26.76,0,0,0,840.61,585.1Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M904.9,521a20.82,20.82,0,0,1-3.43,2.74,22.45,22.45,0,0,1-.63,6.79,18.75,18.75,0,0,1,2,.46,24.76,24.76,0,0,1,4.23-1.83c10.18-3.34,20.47.21,23,7.92a11.68,11.68,0,0,1,.32,6c3.35-3.94,4.74-8.74,3.3-13.14-2.54-7.71-12.84-11.26-23-7.92a24.76,24.76,0,0,0-4.23,1.83c-.65-.18-1.32-.34-2-.46C904.65,522.59,904.79,521.8,904.9,521Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M829.35,607.49a25.09,25.09,0,0,0-2.29,3.71,26.56,26.56,0,0,0-1.54,3.74,24.48,24.48,0,0,1,3-3.4A22.92,22.92,0,0,1,829.35,607.49Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M891.09,491.54a22,22,0,0,1,.17-4.41,24.93,24.93,0,0,0-4.78,6.57,25.63,25.63,0,0,0-1.52,3.73A22.75,22.75,0,0,1,891.09,491.54Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M875.4,579.1a24.29,24.29,0,0,1-1,4.38,26.67,26.67,0,0,0,2.09-3.44,25.49,25.49,0,0,0,1.63-4A24.23,24.23,0,0,1,875.4,579.1Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M860.32,608.92a24.15,24.15,0,0,1-1,4.38,25.65,25.65,0,0,0,2.1-3.44,26.47,26.47,0,0,0,1.63-4A23.57,23.57,0,0,1,860.32,608.92Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M867.86,594a24.11,24.11,0,0,1-1,4.38A26.67,26.67,0,0,0,869,595a25.49,25.49,0,0,0,1.63-4A24.23,24.23,0,0,1,867.86,594Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M882.94,564.19a24,24,0,0,1-1,4.37,25.89,25.89,0,0,0,2.09-3.43,25.48,25.48,0,0,0,1.64-4.07A23.22,23.22,0,0,1,882.94,564.19Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M833.57,526.48c7.72-2.53,16.68,3.66,20,13.83a25.68,25.68,0,0,1,1,4.51,21.18,21.18,0,0,1,4.44,4.73,25.53,25.53,0,0,1,2.08-5.75c.35-.68.73-1.33,1.12-2a21.07,21.07,0,0,0-4-4.18,25.38,25.38,0,0,0-1-4.5c-3.34-10.17-12.3-16.37-20-13.83-4.4,1.44-7.44,5.41-8.62,10.43A11.69,11.69,0,0,1,833.57,526.48Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M869.37,534.48a21.85,21.85,0,0,1,.18-4.4,24.73,24.73,0,0,0-4.79,6.57,25.07,25.07,0,0,0-1.52,3.72A23,23,0,0,1,869.37,534.48Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M880.23,513a21.85,21.85,0,0,1,.18-4.4,24.52,24.52,0,0,0-4.79,6.56,25.63,25.63,0,0,0-1.52,3.73A22.75,22.75,0,0,1,880.23,513Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M852.78,623.83a24.25,24.25,0,0,1-1,4.39,25.73,25.73,0,0,0,3.73-7.49A23.57,23.57,0,0,1,852.78,623.83Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    })
                  ]),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M948.52,430.71a23.68,23.68,0,0,0,8.23-9.32c4.91-9.7,2.88-20.61-4.53-24.36s-17.4,1.08-22.31,10.79A23.68,23.68,0,0,0,927.29,420a24.63,24.63,0,0,0-10.86,21.47,23.61,23.61,0,0,0-8.23,9.32,24.69,24.69,0,0,0-1.51,3.69,20.85,20.85,0,0,1,10.77-8A12.24,12.24,0,0,0,933,454.32a20.85,20.85,0,0,1,0,13.41,25.48,25.48,0,0,0,2.08-3.4,23.68,23.68,0,0,0,2.62-12.15,24.57,24.57,0,0,0,10.86-21.47Z",
                      transform: "translate(-88.65 -57.09)",
                      fill: "#3f3d56"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M1067.88,293.07a72,72,0,0,0,8.72-4.83l-32.33-23.62,38,19.57a72.13,72.13,0,0,0,27-50.31l-64.58.66,64.72-10.82A72,72,0,1,0,966.83,242a72.09,72.09,0,0,0-13.26,8l33.75,46.93L946.8,255.85a72.08,72.08,0,0,0-20.17,65.61,72,72,0,1,0,101.05,51.1,72,72,0,0,0,40.2-79.49Z",
                      transform: "translate(-88.65 -57.09)",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M933,274.75a71.77,71.77,0,0,0-6.35,46.71,72,72,0,1,0,101.05,51.1C1041.83,366,936.62,267.54,933,274.75Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "925.49",
                      cy: "102.72",
                      r: "10.69",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "987.93",
                      cy: "109.58",
                      r: "10.69",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "1012.01",
                      cy: "205.64",
                      r: "10.69",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "979.51",
                      cy: "253.61",
                      r: "10.69",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "935.11",
                      cy: "353.24",
                      r: "10.69",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "935.11",
                      cy: "353.24",
                      r: "10.69",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "836.39",
                      cy: "240.4",
                      r: "10.69",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "836.39",
                      cy: "240.4",
                      r: "10.69",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M913.64,473.32c-7.11-3.59-9.26-13.76-5.11-23.14-.22.38-.43.77-.63,1.18-4.91,9.7-2.88,20.6,4.53,24.35s17.4-1.08,22.3-10.78c.21-.4.39-.81.57-1.21C930.21,472.63,920.74,476.92,913.64,473.32Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M903.08,494.2c-7.1-3.59-9.26-13.76-5.1-23.15-.22.39-.44.78-.64,1.18-4.91,9.7-2.88,20.61,4.53,24.35s17.4-1.07,22.31-10.78c.2-.4.39-.8.57-1.21C919.65,493.5,910.19,497.79,903.08,494.2Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M892.52,515.07c-7.1-3.59-9.26-13.76-5.1-23.14-.22.38-.44.77-.64,1.18-4.91,9.7-2.87,20.6,4.54,24.35s17.39-1.08,22.3-10.78c.2-.4.39-.81.57-1.21C909.1,514.38,899.63,518.67,892.52,515.07Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M882,536c-7.11-3.59-9.26-13.76-5.11-23.14-.22.38-.43.77-.64,1.17-4.9,9.7-2.87,20.61,4.54,24.36s17.4-1.08,22.3-10.79c.21-.4.39-.8.57-1.21C898.54,535.25,889.07,539.54,882,536Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M871.41,556.82c-7.11-3.59-9.26-13.76-5.11-23.14-.22.38-.43.77-.63,1.18-4.91,9.7-2.88,20.6,4.53,24.35s17.4-1.08,22.31-10.78c.2-.4.39-.81.57-1.21C888,556.13,878.51,560.42,871.41,556.82Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M860.85,577.7c-7.1-3.59-9.26-13.76-5.1-23.14-.22.38-.44.77-.64,1.17-4.91,9.7-2.88,20.61,4.54,24.36S877,579,882,569.3c.2-.4.39-.8.57-1.21C877.42,577,868,581.29,860.85,577.7Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M850.29,598.57c-7.1-3.59-9.26-13.76-5.1-23.14-.22.39-.43.77-.64,1.18-4.9,9.7-2.87,20.6,4.54,24.35s17.4-1.08,22.3-10.78c.21-.4.39-.81.57-1.21C866.87,597.88,857.4,602.17,850.29,598.57Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M839.74,619.45c-7.11-3.59-9.26-13.76-5.11-23.14q-.33.57-.63,1.17c-4.91,9.7-2.88,20.61,4.53,24.36s17.4-1.08,22.31-10.79c.2-.4.38-.8.56-1.21C856.31,618.75,846.84,623,839.74,619.45Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M832.8,633.17c-7.1-3.6-9.26-13.76-5.1-23.15-.22.39-.44.78-.64,1.18-4.91,9.7-2.88,20.61,4.53,24.35s17.4-1.07,22.31-10.78c.2-.4.39-.8.57-1.21C849.37,632.47,839.9,636.76,832.8,633.17Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M1023.59,540.26a37.4,37.4,0,0,0,2-9.79,5.34,5.34,0,1,0-.81-10.62,37.31,37.31,0,0,0-19.64-25.31,5.34,5.34,0,1,0-9.54-4.82,5,5,0,0,0-.48,1.43A37.49,37.49,0,0,0,962.25,501a37.64,37.64,0,0,0-9.82-.29l-4.33,19.71-.26-19a37.42,37.42,0,1,0,20,72,5.28,5.28,0,0,0,2.25,2.16,5.34,5.34,0,0,0,7.32-6.88,37.35,37.35,0,0,0,4.8-3.92,37.45,37.45,0,0,0,39.31-19.83l-20.15-3.39Z",
                      transform: "translate(-88.65 -57.09)",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("g", { attrs: { opacity: "0.1" } }, [
                    _c("path", {
                      attrs: {
                        d:
                          "M992.46,549.83c-7.44-9.82-12-21.45-17.25-32.61a136.38,136.38,0,0,0-7.07-13.36l-3.94-4.59c-.66.56-1.32,1.14-2,1.75a37.64,37.64,0,0,0-9.82-.29l-4.33,19.71-.26-19a37.42,37.42,0,1,0,20,72,5.28,5.28,0,0,0,2.25,2.16,5.34,5.34,0,0,0,7.32-6.88,37.35,37.35,0,0,0,4.8-3.92,37.49,37.49,0,0,0,22.44-3.32A52.71,52.71,0,0,1,992.46,549.83Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    })
                  ]),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M860.71,507.63a5.34,5.34,0,0,0-4.78-7.75,37.37,37.37,0,0,0-11.7-20.83,37.52,37.52,0,0,0,1.1-11.7L825.68,464l19.08-1.2a38,38,0,0,0-1.41-5.28,5.46,5.46,0,0,0,1.76-2,5.35,5.35,0,0,0-6.59-7.44A37.42,37.42,0,0,0,771.73,479a5.25,5.25,0,0,0-2.66,2.5,5.34,5.34,0,0,0,6.75,7.37,37.53,37.53,0,0,0,7.09,8.65,37.4,37.4,0,0,0,1.74,23.76L811,514.44,787.5,526.8a37.42,37.42,0,0,0,68.91-16.26A5.33,5.33,0,0,0,860.71,507.63Z",
                      transform: "translate(-88.65 -57.09)",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M860.71,507.63a5.34,5.34,0,0,0-4.78-7.75,37.37,37.37,0,0,0-11.7-20.83c.16-.63.3-1.25.42-1.88a13.18,13.18,0,0,0-1.93,1.71c-3.55,3.89-5.37,9.12-8.88,13.05-4.14,4.64-10.34,7.06-16.53,7.71s-12.42-.3-18.53-1.49c-5.06-1-10.19-2.16-15.32-1.67-.5,0-1,.11-1.46.19.3.29.6.58.91.86a37.4,37.4,0,0,0,1.74,23.76L811,514.44,787.5,526.8a37.42,37.42,0,0,0,68.91-16.26A5.33,5.33,0,0,0,860.71,507.63Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  })
                ]),
                _vm._v(" "),
                _c("g", { attrs: { opacity: "0.1" } }, [
                  _c("path", {
                    attrs: {
                      d:
                        "M178.14,568.33c1.28-3.89,6.47-5.68,11.59-4a12.78,12.78,0,0,1,2.13.92c.33-.09.67-.17,1-.23a11.26,11.26,0,0,1-.32-3.42,12.46,12.46,0,0,1-5.47-10.82,11.92,11.92,0,0,1-4.14-4.69,12,12,0,0,1-1.33-6.12,12,12,0,0,1-4.14-4.7C175,530.39,176,524.9,179.75,523s8.77.55,11.24,5.43a12,12,0,0,1,1.32,6.13,12.37,12.37,0,0,1,5.47,10.81,12.4,12.4,0,0,1,5.47,10.82A12.37,12.37,0,0,1,208.72,567a12,12,0,0,1,4.15,4.7,12.66,12.66,0,0,1,1,2.9,10.66,10.66,0,0,1,2.23-2.39,12.58,12.58,0,0,1,.52-2.27c1.69-5.12,6.2-8.24,10.09-7s5.67,6.47,4,11.59a11.67,11.67,0,0,1-3.81,5.59,12.67,12.67,0,0,1-.52,2.26,11.1,11.1,0,0,1-5.11,6.42,12.84,12.84,0,0,1,.42,2,12.57,12.57,0,0,1,2.53,3.43,12.32,12.32,0,0,1,1.26,4.08,12.55,12.55,0,0,1,2.54,3.43,12.39,12.39,0,0,1,1.26,4.08,12.45,12.45,0,0,1,2.54,3.44c2.47,4.88,1.45,10.38-2.28,12.26s-8.77-.54-11.24-5.43a12.48,12.48,0,0,1-1.26-4.08,12.7,12.7,0,0,1-3.8-7.51,12.7,12.7,0,0,1-3.8-7.51,12.6,12.6,0,0,1-2.54-3.43,12.73,12.73,0,0,1-1.26-4.08,12.57,12.57,0,0,1-2.53-3.43,12.32,12.32,0,0,1-1.26-4.08,11.63,11.63,0,0,1-1.71-2,11.9,11.9,0,0,1-6.18-.38,13.29,13.29,0,0,1-2.14-.93,11.61,11.61,0,0,1-6.75-.24C180,576.73,176.87,572.22,178.14,568.33Z",
                      transform: "translate(-88.65 -57.09)",
                      fill: "#3f3d56"
                    }
                  }),
                  _vm._v(" "),
                  _c("g", { attrs: { opacity: "0.1" } }, [
                    _c("path", {
                      attrs: {
                        d:
                          "M187.17,553a10.72,10.72,0,0,0,1.74,1.39,11.31,11.31,0,0,0,.56,4.24,11.93,11.93,0,0,1-1.06-1.73A12.46,12.46,0,0,1,187.17,553Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M181.7,542.2a11.21,11.21,0,0,0,1.74,1.38,11.39,11.39,0,0,0,.56,4.25,12.7,12.7,0,0,1-2.3-5.63Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M194.13,538.17a11.11,11.11,0,0,0-.08-2.22,12.66,12.66,0,0,1,2.41,3.31,13,13,0,0,1,.76,1.88A11.42,11.42,0,0,0,194.13,538.17Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M228.83,603.63a11.65,11.65,0,0,0-1.48-1.7,12.4,12.4,0,0,0-.44-2,13.23,13.23,0,0,1,1.15,1.86A13,13,0,0,1,228.83,603.63Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M225,596.12a11.65,11.65,0,0,0-1.48-1.7,11.75,11.75,0,0,0-.42-2h0a12.67,12.67,0,0,1,1.88,3.68Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M192.65,563.84a10.11,10.11,0,0,0,1.73,1.37,10.9,10.9,0,0,0,.32,3.42,10,10,0,0,0-1,.23,13.26,13.26,0,0,0-2.14-.92c-5.12-1.68-10.31.11-11.58,4a5.82,5.82,0,0,0-.17,3,6.93,6.93,0,0,1-1.66-6.61c1.28-3.89,6.47-5.68,11.59-4a12.78,12.78,0,0,1,2.13.92c.33-.09.67-.17,1-.23A10.32,10.32,0,0,1,192.65,563.84Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M230.71,607.4a12.79,12.79,0,0,1,1.15,1.87,13,13,0,0,1,.77,1.88,11.74,11.74,0,0,0-1.48-1.71A12.4,12.4,0,0,0,230.71,607.4Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M199.6,549a11.08,11.08,0,0,0-.08-2.22,12.49,12.49,0,0,1,2.41,3.31,12.87,12.87,0,0,1,.76,1.87A11.38,11.38,0,0,0,199.6,549Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M207.51,593.1a11.94,11.94,0,0,0,.49,2.2,12.63,12.63,0,0,1-1.88-3.77A11.72,11.72,0,0,0,207.51,593.1Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M215.1,608.12a12.66,12.66,0,0,0,.5,2.2,11.93,11.93,0,0,1-1.06-1.73,12.88,12.88,0,0,1-.82-2A13,13,0,0,0,215.1,608.12Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M211.31,600.61a11.94,11.94,0,0,0,.49,2.2,12.88,12.88,0,0,1-1.06-1.73,12.6,12.6,0,0,1-.82-2A11.72,11.72,0,0,0,211.31,600.61Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M203.71,585.58a11.86,11.86,0,0,0,.49,2.21,12.44,12.44,0,0,1-1-1.73,12.23,12.23,0,0,1-.83-2A11.13,11.13,0,0,0,203.71,585.58Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M228.58,566.59c-3.89-1.28-8.4,1.84-10.08,7a12.58,12.58,0,0,0-.52,2.27,10.63,10.63,0,0,0-2.24,2.38,12.83,12.83,0,0,0-1.05-2.9c-.17-.34-.36-.67-.56-1a10.63,10.63,0,0,1,2-2.1,12.58,12.58,0,0,1,.52-2.27c1.69-5.12,6.2-8.24,10.09-7a6.93,6.93,0,0,1,4.34,5.26A5.93,5.93,0,0,0,228.58,566.59Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M210.54,570.62a11.11,11.11,0,0,0-.08-2.22,12.49,12.49,0,0,1,2.41,3.31,13,13,0,0,1,.76,1.88A11.28,11.28,0,0,0,210.54,570.62Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M205.07,559.8a11.13,11.13,0,0,0-.08-2.22,12.83,12.83,0,0,1,2.41,3.31,13,13,0,0,1,.76,1.88A11.42,11.42,0,0,0,205.07,559.8Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M218.9,615.63a11.9,11.9,0,0,0,.5,2.21,12.61,12.61,0,0,1-1.06-1.74,12.88,12.88,0,0,1-.82-2A13,13,0,0,0,218.9,615.63Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    })
                  ]),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M170.67,518.34a11.92,11.92,0,0,1-4.14-4.69c-2.47-4.89-1.45-10.38,2.28-12.27s8.77.54,11.24,5.43a11.93,11.93,0,0,1,1.32,6.12,12.4,12.4,0,0,1,5.47,10.82,12,12,0,0,1,4.15,4.69,13.23,13.23,0,0,1,.76,1.86,10.57,10.57,0,0,0-5.43-4,6.16,6.16,0,0,1-7.83,4,10.52,10.52,0,0,0,0,6.75,13.19,13.19,0,0,1-1-1.71,12,12,0,0,1-1.33-6.12,12.43,12.43,0,0,1-5.47-10.82Z",
                      transform: "translate(-88.65 -57.09)",
                      fill: "#3f3d56"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M110.55,449a36.81,36.81,0,0,1-4.39-2.43l16.28-11.9-19.14,9.85a36.34,36.34,0,0,1-13.59-25.34l32.54.34-32.61-5.46a36.29,36.29,0,1,1,71.81,9.2,36.73,36.73,0,0,1,6.68,4l-17,23.64,20.41-20.68a36.32,36.32,0,0,1,10.16,33.05,36.29,36.29,0,1,1-50.9,25.74,36.28,36.28,0,0,1-20.25-40Z",
                      transform: "translate(-88.65 -57.09)",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M178.5,439.78a36.12,36.12,0,0,1,3.2,23.53,36.29,36.29,0,1,1-50.9,25.74C123.67,485.74,176.67,436.15,178.5,439.78Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "48.97",
                      cy: "324.78",
                      r: "5.39",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "17.51",
                      cy: "328.24",
                      r: "5.39",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "5.39",
                      cy: "376.63",
                      r: "5.39",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "21.76",
                      cy: "400.8",
                      r: "5.39",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "44.12",
                      cy: "450.99",
                      r: "5.39",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "44.12",
                      cy: "450.99",
                      r: "5.39",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "93.85",
                      cy: "394.14",
                      r: "5.39",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("circle", {
                    attrs: {
                      cx: "93.85",
                      cy: "394.14",
                      r: "5.39",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M188.25,539.81c3.58-1.81,4.66-6.93,2.57-11.66.11.2.22.39.32.59,2.47,4.89,1.45,10.38-2.29,12.27s-8.76-.54-11.23-5.43c-.1-.2-.2-.4-.29-.61C179.9,539.46,184.67,541.62,188.25,539.81Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M193.56,550.33c3.58-1.81,4.67-6.94,2.58-11.66.11.19.22.39.32.59,2.47,4.89,1.45,10.38-2.29,12.27s-8.76-.54-11.23-5.43c-.11-.2-.2-.41-.29-.61C185.22,550,190,552.14,193.56,550.33Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M198.88,560.84c3.58-1.81,4.67-6.93,2.57-11.66.12.2.22.39.33.6,2.47,4.88,1.44,10.38-2.29,12.26s-8.76-.54-11.23-5.43c-.11-.2-.2-.4-.29-.61C190.53,560.49,195.3,562.65,198.88,560.84Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M204.2,571.36c3.58-1.81,4.67-6.93,2.57-11.66.11.19.22.39.32.59,2.48,4.89,1.45,10.38-2.28,12.27s-8.77-.54-11.24-5.43c-.1-.2-.19-.41-.28-.61C195.85,571,200.62,573.17,204.2,571.36Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M209.52,581.87c3.58-1.81,4.66-6.93,2.57-11.65.11.19.22.39.32.59,2.47,4.89,1.45,10.38-2.28,12.27s-8.77-.55-11.24-5.43c-.1-.21-.19-.41-.29-.61C201.17,581.52,205.94,583.68,209.52,581.87Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M214.84,592.39c3.58-1.81,4.66-6.93,2.57-11.66.11.2.22.39.32.59,2.47,4.89,1.45,10.38-2.28,12.27s-8.77-.54-11.24-5.43c-.1-.2-.2-.4-.29-.61C206.49,592,211.26,594.2,214.84,592.39Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M220.16,602.91c3.57-1.81,4.66-6.94,2.57-11.66.11.19.22.39.32.59,2.47,4.89,1.45,10.38-2.29,12.27s-8.76-.55-11.23-5.43c-.1-.21-.2-.41-.29-.61C211.81,602.55,216.58,604.72,220.16,602.91Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M225.47,613.42c3.58-1.81,4.67-6.93,2.57-11.66.12.2.22.39.33.6,2.47,4.88,1.44,10.38-2.29,12.26s-8.76-.54-11.23-5.43c-.11-.2-.2-.4-.29-.61C217.13,613.07,221.89,615.23,225.47,613.42Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M229,620.33c3.58-1.81,4.66-6.93,2.57-11.66.11.2.22.39.32.6,2.47,4.88,1.45,10.38-2.28,12.26s-8.77-.54-11.24-5.43c-.1-.2-.2-.4-.29-.61C220.62,620,225.39,622.14,229,620.33Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M132.86,573.53a18.57,18.57,0,0,1-1-4.93,2.69,2.69,0,1,1,.41-5.35,18.82,18.82,0,0,1,9.89-12.75,2.69,2.69,0,1,1,4.81-2.43,2.44,2.44,0,0,1,.24.72,18.92,18.92,0,0,1,16.56,5,18.68,18.68,0,0,1,5-.14l2.18,9.92L171,554a18.85,18.85,0,1,1-10.08,36.29,2.76,2.76,0,0,1-1.13,1.09,2.7,2.7,0,0,1-3.7-3.47,18.84,18.84,0,0,1-2.41-2,18.87,18.87,0,0,1-19.8-10l10.15-1.71Z",
                      transform: "translate(-88.65 -57.09)",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("g", { attrs: { opacity: "0.1" } }, [
                    _c("path", {
                      attrs: {
                        d:
                          "M148.54,578.35c3.75-5,6.05-10.8,8.69-16.42a66.7,66.7,0,0,1,3.56-6.74l2-2.31c.34.29.67.58,1,.88a18.68,18.68,0,0,1,5-.14l2.18,9.92L171,554a18.85,18.85,0,1,1-10.08,36.29,2.76,2.76,0,0,1-1.13,1.09,2.7,2.7,0,0,1-3.7-3.47,18.84,18.84,0,0,1-2.41-2,19,19,0,0,1-11.31-1.67A26.59,26.59,0,0,0,148.54,578.35Z",
                        transform: "translate(-88.65 -57.09)"
                      }
                    })
                  ]),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M214.91,557.09a2.68,2.68,0,0,1,1.19-3.61,2.64,2.64,0,0,1,1.22-.29,18.85,18.85,0,0,1,5.89-10.5,18.71,18.71,0,0,1-.55-5.89l9.89-1.66-9.61-.61a18.65,18.65,0,0,1,.72-2.66,2.64,2.64,0,0,1-.89-1,2.7,2.7,0,0,1,3.32-3.75,18.63,18.63,0,0,1,6.87-5.93,18.84,18.84,0,0,1,26.77,21.5,2.69,2.69,0,0,1,.16,4.87,2.7,2.7,0,0,1-2.22.1A18.74,18.74,0,0,1,254.1,552a18.9,18.9,0,0,1-.87,12L240,560.52l11.83,6.23A18.86,18.86,0,0,1,219,565.21a19.11,19.11,0,0,1-1.94-6.65A2.67,2.67,0,0,1,214.91,557.09Z",
                      transform: "translate(-88.65 -57.09)",
                      fill: "#6c63ff"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M214.91,557.09a2.68,2.68,0,0,1,1.19-3.61,2.64,2.64,0,0,1,1.22-.29,18.85,18.85,0,0,1,5.89-10.5c-.08-.31-.15-.63-.21-.94a7.27,7.27,0,0,1,1,.86c1.79,2,2.71,4.59,4.47,6.57a12.91,12.91,0,0,0,8.33,3.89,31.54,31.54,0,0,0,9.33-.75,27.35,27.35,0,0,1,7.72-.85l.74.1-.46.43a18.9,18.9,0,0,1-.87,12L240,560.52l11.83,6.23A18.86,18.86,0,0,1,219,565.21a19.11,19.11,0,0,1-1.94-6.65A2.67,2.67,0,0,1,214.91,557.09Z",
                      transform: "translate(-88.65 -57.09)",
                      opacity: "0.1"
                    }
                  })
                ]),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M435,109a20.23,20.23,0,0,0-11.74,1.28,17.32,17.32,0,0,1-14.1,0,19.76,19.76,0,0,0-16.58.33,10.28,10.28,0,0,1-4.77,1.19c-6.72,0-12.31-6.77-13.47-15.7a13.07,13.07,0,0,0,3.36-3.62c3.94-6.35,10-10.43,16.89-10.43s12.89,4,16.83,10.31a13,13,0,0,0,11.16,6.14h.18C428.06,98.47,432.69,102.76,435,109Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#6c63ff",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M455.42,81l-10.86,6.89,6.59-12a10.74,10.74,0,0,0-6.57-2.34h-.17a12.89,12.89,0,0,1-2.25-.17l-3.69,2.34,1.58-2.87A13.19,13.19,0,0,1,433.61,68L427,72.13l4.16-7.57c-3.85-4.63-9.05-7.47-14.76-7.47-6.85,0-13,4.08-16.9,10.43a12.62,12.62,0,0,1-11.17,6H388c-7.56,0-13.7,8.57-13.7,19.16s6.14,19.15,13.7,19.15a10.28,10.28,0,0,0,4.77-1.19,19.72,19.72,0,0,1,16.58-.32,17.37,17.37,0,0,0,14.1,0,19.75,19.75,0,0,1,16.43.32,10.35,10.35,0,0,0,4.72,1.16c7.57,0,13.7-8.57,13.7-19.15A24.36,24.36,0,0,0,455.42,81Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#6c63ff",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M209,247.54a29,29,0,0,0-16.77,1.82,24.71,24.71,0,0,1-20.14-.05,28.22,28.22,0,0,0-23.68.47,14.75,14.75,0,0,1-6.82,1.7c-9.6,0-17.59-9.67-19.25-22.43a18.41,18.41,0,0,0,4.8-5.17c5.63-9.07,14.35-14.9,24.14-14.9s18.4,5.76,24,14.73a18.52,18.52,0,0,0,16,8.77h.25C199.11,232.47,205.73,238.6,209,247.54Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#6c63ff",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M238.2,207.49l-15.52,9.84,9.42-17.13a15.34,15.34,0,0,0-9.39-3.35h-.25a18.16,18.16,0,0,1-3.22-.24L214,200l2.26-4.1a18.7,18.7,0,0,1-9.2-7l-9.42,6L203.57,184c-5.51-6.61-12.93-10.66-21.09-10.66-9.79,0-18.51,5.82-24.14,14.89a18.05,18.05,0,0,1-16,8.61h-.53c-10.81,0-19.57,12.25-19.57,27.37s8.76,27.37,19.57,27.37a14.61,14.61,0,0,0,6.82-1.71,28.22,28.22,0,0,1,23.68-.46,24.71,24.71,0,0,0,20.14.05,28.25,28.25,0,0,1,23.48.45,14.65,14.65,0,0,0,6.74,1.67c10.81,0,19.57-12.26,19.57-27.37A34.76,34.76,0,0,0,238.2,207.49Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#6c63ff",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M836.62,148a20.24,20.24,0,0,1,11.74,1.28,17.29,17.29,0,0,0,14.09,0,19.76,19.76,0,0,1,16.58.33,10.31,10.31,0,0,0,4.77,1.19c6.72,0,12.32-6.77,13.48-15.7a12.93,12.93,0,0,1-3.36-3.62C890,125.11,883.87,121,877,121s-12.88,4-16.82,10.31A13,13,0,0,1,849,137.48h-.17C843.51,137.47,838.87,141.76,836.62,148Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#6c63ff",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M816.14,120,827,126.87l-6.6-12a10.76,10.76,0,0,1,6.57-2.34h.18a13,13,0,0,0,2.25-.17l3.68,2.34-1.58-2.87A13.21,13.21,0,0,0,838,107l6.59,4.18-4.17-7.57c3.86-4.63,9-7.47,14.77-7.47,6.85,0,13,4.08,16.9,10.43a12.61,12.61,0,0,0,11.17,6h.36c7.57,0,13.7,8.57,13.7,19.16s-6.13,19.15-13.7,19.15a10.34,10.34,0,0,1-4.77-1.19,19.72,19.72,0,0,0-16.58-.32,17.35,17.35,0,0,1-14.09,0,19.77,19.77,0,0,0-16.44.32,10.32,10.32,0,0,1-4.72,1.16c-7.56,0-13.7-8.57-13.7-19.15A24.36,24.36,0,0,1,816.14,120Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#6c63ff",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "615.63",
                    cy: "756.88",
                    rx: "115",
                    ry: "20",
                    fill: "#6c63ff",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("polygon", {
                  attrs: {
                    points:
                      "555.44 661.88 377.25 659.59 377.78 655.02 386.39 579.63 542.88 579.63 554.39 655.02 555.27 660.74 555.44 661.88",
                    fill: "#d0d2d5"
                  }
                }),
                _vm._v(" "),
                _c("polygon", {
                  attrs: {
                    points:
                      "555.27 660.74 466.35 660.74 377.25 659.59 377.78 655.02 554.39 655.02 555.27 660.74",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "347.55",
                    y: "656.17",
                    width: "236.45",
                    height: "5.71",
                    fill: "#d0d2d5"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M898.24,183.92A14.87,14.87,0,0,0,883.44,169H223.12a14.87,14.87,0,0,0-14.8,14.94V584.19H898.24Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M208.32,580.19v46.88a14.8,14.8,0,0,0,14.8,14.8H883.44a14.8,14.8,0,0,0,14.8-14.8V580.19Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#d0d2d5"
                  }
                }),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "148.23",
                    y: "137.01",
                    width: "636.23",
                    height: "359.81",
                    fill: "#fff"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M556.71,624.08a15.4,15.4,0,0,0,12.13-5.89h0a16.06,16.06,0,0,0,1.2-1.76L561.57,615l9.15.06a15.42,15.42,0,0,0,.29-12.21l-12.27,6.36,11.32-8.32a15.42,15.42,0,1,0-25.47,17.26h0A15.4,15.4,0,0,0,556.71,624.08Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#6c63ff"
                  }
                }),
                _vm._v(" "),
                _c("polygon", {
                  attrs: {
                    points:
                      "483.48 584.77 554.57 656.17 543.66 584.77 483.48 584.77",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "147.73",
                    y: "137.05",
                    width: "636.92",
                    height: "21.02",
                    fill: "#444053",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("rect", {
                  attrs: {
                    x: "368.87",
                    y: "140.71",
                    width: "191.9",
                    height: "12.79",
                    rx: "0.58",
                    fill: "#6c63ff",
                    opacity: "0.3"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M643.72,205.52h-.47l-.17-.15a3.89,3.89,0,0,0,.9-2.49,3.78,3.78,0,1,0-3.77,3.81,3.9,3.9,0,0,0,2.49-.91l.17.15v.47l2.93,2.93.87-.88Zm-3.51,0a2.64,2.64,0,1,1,2.63-2.64A2.62,2.62,0,0,1,640.21,205.52Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("circle", {
                  attrs: {
                    cx: "159.18",
                    cy: "147.56",
                    r: "3.85",
                    fill: "#fa5959",
                    opacity: "0.8"
                  }
                }),
                _vm._v(" "),
                _c("circle", {
                  attrs: {
                    cx: "169.77",
                    cy: "147.56",
                    r: "3.85",
                    fill: "#fed253",
                    opacity: "0.8"
                  }
                }),
                _vm._v(" "),
                _c("circle", {
                  attrs: {
                    cx: "180.37",
                    cy: "147.56",
                    r: "3.85",
                    fill: "#8ccf4d",
                    opacity: "0.8"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M588.7,348.49c-8.73-11.6-21.38-18.92-35.46-18.92s-26.73,7.32-35.46,18.92a38.39,38.39,0,0,0,8.4,12.65,38.28,38.28,0,0,0,62.52-12.65Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#6c63ff"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M513.17,355.28a9.17,9.17,0,0,1-1.76-1,7.06,7.06,0,0,1-1.94-2.51,7.18,7.18,0,1,0-11.72,1.74,8,8,0,0,0,1.7,1.37,4.94,4.94,0,0,1,1.91,2,14.44,14.44,0,0,0,3.32,4.36,29,29,0,0,0,4.55,3.2A66.31,66.31,0,0,0,505.49,384a27.05,27.05,0,0,0-7.62,1.23,12.29,12.29,0,0,0-3.53,1.76,8.48,8.48,0,0,0-.87-.06,7.19,7.19,0,1,0,6.73,9.72,4.59,4.59,0,0,1,3.71-3,16.75,16.75,0,0,1,1.85-.12,64.4,64.4,0,0,0,8.55,26.67c-4.24,3.29-6.85,6.88-7.95,10.86a3,3,0,0,0-.57.41,6.81,6.81,0,0,0-.84.78A7.18,7.18,0,1,0,517,434.6a4.71,4.71,0,0,1,1.17-5.08c.48-.45,1-.93,1.7-1.46,8.11,9.47,17.76,15.54,29.81,16.26V380.07C533.75,379.2,519.87,368.83,513.17,355.28ZM613,387a7.93,7.93,0,0,0-.87.06,13.56,13.56,0,0,0-3.53-1.76,26.86,26.86,0,0,0-7.62-1.23,67.76,67.76,0,0,0-3.74-19.55,29,29,0,0,0,4.55-3.2,15.58,15.58,0,0,0,3.44-4.57A4.22,4.22,0,0,1,607,355a0,0,0,0,0,0,0,7.18,7.18,0,1,0-10-3.17,6.82,6.82,0,0,1-1.94,2.51,18.85,18.85,0,0,1-1.76,1.29c-6.7,13.54-20.57,23.62-36.48,24.49v64.31c12-.72,21.71-6.82,29.81-16.26.63.5,1.16.95,1.61,1.37a4.86,4.86,0,0,1,1.26,5.23,7.18,7.18,0,1,0,12.08-2.33,6.81,6.81,0,0,0-.84-.78c-.33-.26-.57-.41-.57-.41-1.1-4-3.7-7.57-8-10.86a64.4,64.4,0,0,0,8.55-26.67,15.9,15.9,0,0,1,1.77.12,4.8,4.8,0,0,1,3.85,3,7.18,7.18,0,0,0,13.85-2.18A7.29,7.29,0,0,0,613,387Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#6c63ff"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M769.65,802.31a9.56,9.56,0,0,0-2.17-2.41c-4.37-4.13-6.4-10.19-7.48-16.13s-1.39-12-3.12-17.81a58.74,58.74,0,0,0-3.52-8.67c-1-2.14-2.26-6.33-4.09-7.83a2.7,2.7,0,0,0-1.26-.61,14.85,14.85,0,0,0-3.62-4.82c-2.86-2.59-6.35-4.65-8.26-8a18,18,0,0,0-1.93-3.29c-1.29-1.42-3.33-2-4.52-3.5-1.55-1.94-1.2-4.72-1-7.19s0-5.43-2.14-6.73c-1.28-.79-2.93-.71-4.26-1.41-2-1-2.79-3.52-2.75-5.77s.74-4.44.92-6.69c.56-7.16-4.16-14.28-2.34-21.22.69-2.63,2.27-4.91,3.44-7.36a15.37,15.37,0,0,0,1-2.54,35.73,35.73,0,0,0,9.74,2.35c-5.51-12.36-4.11-26.72-6.68-40l.33-.45a20.84,20.84,0,0,0,4.22-11.86c0-4.94-2.31-9.56-3.35-14.4-.89-4.11-.85-8.41-2-12.45a37.65,37.65,0,0,0-3.16-7.22q-1.87-3.47-3.93-6.83-1.92-6.36-3.85-12.72c-1.8-5.95-3.65-12-7.15-17.14-1.28-1.88-1.67-5.7-3.64-6.84a8.81,8.81,0,0,0-5.2-.91c-2.78-1.56-5.22-3.81-5.57-6.89a6.68,6.68,0,0,1,.2-2l.34,0c4.4-.4,6.63-4.28,8.92-7.68,3.7-5.5,2.29-12.94,0-19.2a13,13,0,0,0-3-5.29c-3.21-3-8.29-2.34-12.43-3.79-1.39-.48-2.69-1.21-4.11-1.55-2.75-.64-5.63.26-8.15,1.53s-4.87,2.91-7.51,3.91-5.9,1.79-6.55,4.5a5,5,0,0,0,.22,2.73,10.18,10.18,0,0,0,3.09,4.46,17.81,17.81,0,0,0,10.87,24.82c.76,1.22,1.47,2.46,2.12,3.73,1.16,2.24,2.14,4.88,1.74,7.28a22.45,22.45,0,0,0-2,2.45c-2.87,4-4.5,8.69-6,13.37a141.65,141.65,0,0,0-4.83,18.27c-2.44,5.19-5.42,10.15-7.19,15.6a35.21,35.21,0,0,1-9.38-1.26l-8.44-1.91c-2.94-.67-6-1.39-8.3-3.33-1.22-1-2.17-2.33-3.41-3.32s-3.73-2.15-5.09-1.33a4,4,0,0,0-.69.53c-1.24-2.51-2.42-5-3.86-7.43-2.07-3.4-5.15-6.51-9.05-7.16a9.21,9.21,0,0,0-6.79,1.58c-2.28,1.62-3.71,5-2,7.28a13.29,13.29,0,0,0,1.39,1.42,29.2,29.2,0,0,1,3.09,4.29A21.91,21.91,0,0,0,619,596.23l-.35,1c-.71,2.08-2.22,4.59-1.84,6.75l37.54,12.85a23.13,23.13,0,0,0,7.56,1.67,12.21,12.21,0,0,0,3-.4l0,1.92v.08c.1,13.19-2,26.29-2.39,39.47-.07,2.41,0,5,1.52,6.88,1.7,2.06,4.72,2.47,7.35,2q.95-.16,1.86-.42a69.33,69.33,0,0,1,1.92,10.11L677.65,696a27.14,27.14,0,0,1,.39,5.54c-.29,4.19-2.5,7.94-4.1,11.81s-2.55,8.5-.45,12.12c.66,1.12,1.57,2.07,2.16,3.23a13.14,13.14,0,0,1,1,5.68q.23,8.08.44,16.18a1.83,1.83,0,0,0-1.26.25c-2.08,1.62-1.85,9.33-2,11.72-.16,4,0,8.08-.22,12.12A72.22,72.22,0,0,1,671,790.74a10.29,10.29,0,0,1-2.29,4.61,9.74,9.74,0,0,1-4.07,2.11,46.49,46.49,0,0,1-15.41,2.1c-2.11-.07-4.31-.27-6.27.53s-3.54,3-2.83,5c.61,1.68,2.46,2.48,4.13,3.11a65.53,65.53,0,0,1,11,5.06,29.74,29.74,0,0,0,4.25,2.41,21.91,21.91,0,0,0,4.38,1.08l17.73,3.06c3.63.62,8,1,10.31-2,1.25-1.62,1.43-3.82,1.37-5.88-.1-4-.9-8.07-.38-12.07a37.14,37.14,0,0,1,1.86-6.93q2.65-7.87,5.32-15.73c1.78-5.26,3.58-10.57,4.27-16.09.25-2,.23-4.28-1.3-5.53a3.54,3.54,0,0,0-1.32-.68c-.06-4.82-.69-9.65-.42-14.47.07-1.2.19-2.4.29-3.61a17.61,17.61,0,0,1,2.47,2.92c1.71,2.68,2.34,6.22,4.95,8,2.22,1.52,5.51,1.44,7.07,3.64a10.26,10.26,0,0,1,1.12,2.71,19.32,19.32,0,0,0,4,6.35,32,32,0,0,0,2.47,6.34q2.21,4.67,4.4,9.31a108.59,108.59,0,0,0,5,9.77,27.55,27.55,0,0,1,3.35,6.46c1.41,4.94-.89,10.36-4.53,14s-8.44,5.73-13.17,7.68a3.71,3.71,0,0,0-1.34.8,2.59,2.59,0,0,0-.61,1.74c0,2.31,1.9,4.29,4.08,5a15.26,15.26,0,0,0,6.83.25c12.78-1.55,25.52-4.67,36.82-10.88a13,13,0,0,0,4.39-3.39A5.13,5.13,0,0,0,769.65,802.31Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "url(#af83dc26-9572-4816-b7a1-1af4f72ff554)"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M715.64,578.06q3.2,4.91,6,10.06a37,37,0,0,1,3.17,7.17c1.16,4,1.13,8.27,2,12.35,1,4.8,3.34,9.38,3.34,14.3a20.56,20.56,0,0,1-4.22,11.76,55.82,55.82,0,0,1-8.82,9.1,187.62,187.62,0,0,1-12.48-61.21c-.1-2.9-.12-5.89.94-8.6.65-1.7,3.77-6.36,5.78-4.53.73.67.92,3.69,1.37,4.7A36.13,36.13,0,0,0,715.64,578.06Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#2f2e41"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M715.64,578.06q3.2,4.91,6,10.06a37,37,0,0,1,3.17,7.17c1.16,4,1.13,8.27,2,12.35,1,4.8,3.34,9.38,3.34,14.3a20.56,20.56,0,0,1-4.22,11.76,55.82,55.82,0,0,1-8.82,9.1,187.62,187.62,0,0,1-12.48-61.21c-.1-2.9-.12-5.89.94-8.6.65-1.7,3.77-6.36,5.78-4.53.73.67.92,3.69,1.37,4.7A36.13,36.13,0,0,0,715.64,578.06Z",
                    transform: "translate(-88.65 -57.09)",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M452,441.63c-7.91,7.9-8.86,11.38-13.61,12.95S416.55,465,421.92,474.81l14.44,9.54.42.28,2.21,6.64-21.84,38.88s-36-16.46-39.53,7.89-1.29,31-2.24,44,.31,16.76-2.86,16.76-4.42-8.54-4.42-8.54-.2-.39-.55-1.12c-4.71-9.79-36.68-81.66,14.53-131.06,0,0,23.72-1.56,29.43-28.76,3.94-18.8,17.72-17.18,26.88-13.35a30.38,30.38,0,0,1,8.22,4.83,40.48,40.48,0,0,1,5.89,7C455.11,431.92,456.53,437.09,452,441.63Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#d0d2d5"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M436.78,484.63l2.21,6.64-21.84,38.88s-36-16.46-39.53,7.89-1.29,31-2.24,44,.31,16.76-2.86,16.76-4.42-8.54-4.42-8.54-.2-.39-.55-1.12c-1.59-12.16-9.65-83.29,19.57-79.51,0,0,23.71,11.08,27.5,6.66,3-3.5,16.32-23.63,21.74-31.89Z",
                    transform: "translate(-88.65 -57.09)",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M452.5,427.74l-14.44,16.41s-16.77,22.44-20.25,21.49a16.23,16.23,0,0,0-3.17-.37,6.16,6.16,0,0,1-4-10.38c5.72-6,16.26-17.39,16.95-19.92s7.4-13.62,10.76-19.05a30.38,30.38,0,0,1,8.22,4.83A40.48,40.48,0,0,1,452.5,427.74Z",
                    transform: "translate(-88.65 -57.09)",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M861.06,663.83c-2.45,4.9-15,23.28-20.49,31.31L838,698.92s-1,6.64-17.39-1.59S419.13,526.61,419.13,526.61l-2.61-7.84,19-28.45L857.59,653.39S864.23,657.5,861.06,663.83Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#454b69"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M840.57,695.14,838,698.92s-1,6.64-17.39-1.59S419.13,526.61,419.13,526.61l-2.61-7.84Z",
                    transform: "translate(-88.65 -57.09)",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M608.29,589c-3.91-.64-8.25-.33-11.29,2.21a9.29,9.29,0,0,0-3.24,6.16c-.26,2.77,1.35,6.06,4.13,6.27a13.17,13.17,0,0,0,2-.13,29.89,29.89,0,0,1,5.24.44,21.39,21.39,0,0,0,18.23-7.36c2.39-3-.76-4.3-3.58-4.9C615.92,590.87,612.15,589.62,608.29,589Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#fbbebe"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M675.17,679.31l2.48,17.62a26.84,26.84,0,0,1,.38,5.51c-.29,4.15-2.5,7.87-4.09,11.71s-2.56,8.44-.45,12c.65,1.11,1.56,2.06,2.15,3.21a12.92,12.92,0,0,1,1,5.63l.68,25a157.33,157.33,0,0,0,23.18-.13,1.29,1.29,0,0,0,.84-.26,1.36,1.36,0,0,0,.29-.91c.34-5.85-.68-11.71-.35-17.56.12-2.14.42-4.27.46-6.42.12-8.71-4.18-17.24-2.88-25.85a57,57,0,0,1,1.6-6.43c4.11-15,3.24-30.76,2.33-46.25a1.09,1.09,0,0,0-.2-.7,1.06,1.06,0,0,0-.54-.29,28.45,28.45,0,0,0-25.78,4.9c-1.09.88-3.84,1.73-4.56,2.78-1,1.46.31,2.92.89,4.47A56.89,56.89,0,0,1,675.17,679.31Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M675.17,679.31l2.48,17.62a26.84,26.84,0,0,1,.38,5.51c-.29,4.15-2.5,7.87-4.09,11.71s-2.56,8.44-.45,12c.65,1.11,1.56,2.06,2.15,3.21a12.92,12.92,0,0,1,1,5.63l.68,25a157.33,157.33,0,0,0,23.18-.13,1.29,1.29,0,0,0,.84-.26,1.36,1.36,0,0,0,.29-.91c.34-5.85-.68-11.71-.35-17.56.12-2.14.42-4.27.46-6.42.12-8.71-4.18-17.24-2.88-25.85a57,57,0,0,1,1.6-6.43c4.11-15,3.24-30.76,2.33-46.25a1.09,1.09,0,0,0-.2-.7,1.06,1.06,0,0,0-.54-.29,28.45,28.45,0,0,0-25.78,4.9c-1.09.88-3.84,1.73-4.56,2.78-1,1.46.31,2.92.89,4.47A56.89,56.89,0,0,1,675.17,679.31Z",
                    transform: "translate(-88.65 -57.09)",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M721.54,674c-1.17,2.43-2.74,4.69-3.44,7.3-1.82,6.89,2.89,14,2.33,21.06-.18,2.23-.87,4.4-.92,6.63s.77,4.71,2.75,5.74c1.33.68,3,.61,4.25,1.39,2.11,1.29,2.35,4.22,2.14,6.68s-.56,5.21,1,7.13c1.19,1.49,3.23,2.07,4.51,3.48a17.17,17.17,0,0,1,1.93,3.26c1.91,3.34,5.4,5.38,8.26,8s5.28,6.46,4,10.09c-.94,2.66-3.58,4.3-6.12,5.55a64.93,64.93,0,0,1-14.57,5.15,3.52,3.52,0,0,1-1.67.09,3.57,3.57,0,0,1-1.46-1c-2.95-2.89-6-5.92-7.36-9.81a10.07,10.07,0,0,0-1.12-2.68c-1.56-2.19-4.85-2.11-7.07-3.62-2.6-1.77-3.23-5.28-4.93-7.93s-4.19-4.23-6-6.56c-3.06-3.88-3.81-9.06-6-13.49-.93-1.88-2.12-3.64-2.86-5.6a30.58,30.58,0,0,1-1.37-7.24c-1.41-11.68-5-23.44-2.74-35,.5-2.54,1.27-5,1.59-7.62.55-4.53-.32-9.17.35-13.69a3.77,3.77,0,0,1,1.51-2.91,4,4,0,0,1,1.72-.35,117.28,117.28,0,0,1,17.78.4c3,.29,6.36.9,8.16,3.35,1.53,2.1,1.45,4.91,1.94,7.46.61,3.14,2.2,4.85,3.87,7.31S722.77,671.46,721.54,674Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M698.47,755.26c1.58,0,3.33-.1,4.55.9,1.52,1.25,1.54,3.54,1.3,5.49-.7,5.48-2.49,10.75-4.28,16l-5.32,15.61a36.65,36.65,0,0,0-1.86,6.88c-.52,4,.28,8,.38,12,0,2-.13,4.22-1.38,5.83-2.26,2.91-6.67,2.57-10.3,2l-17.71-3a21.07,21.07,0,0,1-4.38-1.07,30.61,30.61,0,0,1-4.25-2.39,65.42,65.42,0,0,0-11-5c-1.66-.62-3.52-1.41-4.12-3.08-.71-2,.87-4.2,2.83-5s4.15-.6,6.27-.54a47,47,0,0,0,15.4-2.08,9.74,9.74,0,0,0,4.06-2.1A10,10,0,0,0,671,791a70.17,70.17,0,0,0,2.68-16c.21-4,.07-8,.23-12,.1-2.37-.13-10,1.95-11.63,1.59-1.22,8.13,2.15,10.28,2.64A50,50,0,0,0,698.47,755.26Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#2f2e41"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M756.81,766.38c1.73,5.73,2,11.79,3.12,17.68s3.1,11.9,7.47,16a9.87,9.87,0,0,1,2.17,2.4,5.06,5.06,0,0,1-.75,5.23,13.13,13.13,0,0,1-4.39,3.37c-11.29,6.16-24,9.27-36.81,10.81a15.51,15.51,0,0,1-6.82-.25c-2.18-.74-4.11-2.7-4.07-5a2.55,2.55,0,0,1,.6-1.73,3.73,3.73,0,0,1,1.35-.79c4.72-1.94,9.51-4.05,13.16-7.63s5.94-9,4.53-13.86A27.42,27.42,0,0,0,733,786.2a108.35,108.35,0,0,1-5-9.69l-4.4-9.23c-1.29-2.7-2.59-5.48-2.81-8.46a40.6,40.6,0,0,0,16.22-2.6,25.51,25.51,0,0,0,6.67-4c1.7-1.42,3.25-4.07,5.54-2.22,1.84,1.48,3,5.65,4.08,7.76A57,57,0,0,1,756.81,766.38Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#2f2e41"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M692.33,537.19c.44,3.84,4.16,6.37,7.71,7.89l-22.47,7.17c1.45-2.78.28-6.18-1.16-9a50.93,50.93,0,0,0-4-6.41c-.22-.31-.47-.7-.31-1.06a1.12,1.12,0,0,1,.63-.49c4.62-2.06,9.38-4.19,14.43-4.94,1.46-.21,4.22-.79,5.31.69S692.12,535.42,692.33,537.19Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#fbbebe"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M692.33,537.19c.44,3.84,4.16,6.37,7.71,7.89l-22.47,7.17c1.45-2.78.28-6.18-1.16-9a50.93,50.93,0,0,0-4-6.41c-.22-.31-.47-.7-.31-1.06a1.12,1.12,0,0,1,.63-.49c4.62-2.06,9.38-4.19,14.43-4.94,1.46-.21,4.22-.79,5.31.69S692.12,535.42,692.33,537.19Z",
                    transform: "translate(-88.65 -57.09)",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("circle", {
                  attrs: {
                    cx: "590.62",
                    cy: "465.59",
                    r: "17.62",
                    fill: "#fbbebe"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M664,667.68c1.71,2.05,4.72,2.45,7.35,2,6.15-1,11.18-5.53,17.2-7.16,7.38-2,15.19.57,22.16,3.72s13.9,7,21.52,7.54c-6.89-15.36-2.95-33.84-9.54-49.33-1.61-3.79-3.86-7.44-4.22-11.54-.45-5.09,2.09-10,2.48-15.06.36-4.51-1-9-2.3-13.3q-2.41-7.92-4.82-15.84c-1.8-5.91-3.65-11.92-7.14-17-1.29-1.87-1.68-5.66-3.64-6.79-4.28-2.47-10.77.64-15.41.81s-8.87,3.47-11.58,7.2c-2.87,3.94-4.5,8.63-6,13.27a126.15,126.15,0,0,0-5.33,21.23c-.15,1.08-.28,2.16-.38,3.25-1,10.27.46,20.6.54,30.92v.07c.1,13.09-2,26.1-2.39,39.18C662.46,663.24,662.52,665.85,664,667.68Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#2f2e41"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M664.92,621.61c3.45-.87,6.57-3.1,9.25-5.54a38.67,38.67,0,0,0,6.14-7A49.86,49.86,0,0,0,685.6,598a129.36,129.36,0,0,0,7-32.27c.26-3,.34-6.22-1.45-8.6a7.24,7.24,0,0,0-8.75-2.12c-2.36,1.15-3.89,3.48-5.31,5.71-2.81,4.42-5.64,8.9-7.45,13.82-.8,2.18-1.39,4.42-2.17,6.61a61,61,0,0,1-2.74,6.33c-.15,1.08-.28,2.16-.38,3.25C663.42,601,664.84,611.29,664.92,621.61Z",
                    transform: "translate(-88.65 -57.09)",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M691.1,555.2c1.79,2.38,1.71,5.63,1.46,8.59a129.18,129.18,0,0,1-7,32.27,49.43,49.43,0,0,1-5.29,11.16,39.07,39.07,0,0,1-6.14,7c-3.4,3.1-7.54,5.87-12.15,5.91a23.16,23.16,0,0,1-7.56-1.65L616.87,605.7c-.38-2.14,1.13-4.64,1.84-6.7l2-5.93c.57-1.64,1.23-3.41,2.72-4.3s3.85.33,5.09,1.32,2.18,2.29,3.4,3.3c2.31,1.92,5.36,2.64,8.3,3.3l8.43,1.89a35.2,35.2,0,0,0,9.38,1.25c2.35-7.18,6.82-13.5,9.35-20.62.78-2.18,1.37-4.43,2.18-6.61,1.8-4.92,4.64-9.39,7.45-13.82,1.41-2.22,2.94-4.55,5.31-5.71A7.23,7.23,0,0,1,691.1,555.2Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#2f2e41"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M684.89,526.66a8.89,8.89,0,0,0-1.06-3.3,2.77,2.77,0,0,0-3-1.32c-1.76.55-2.35,3.27-4.19,3.36-1.24.06-2.13-1.2-2.52-2.38s-.6-2.53-1.53-3.36a5.7,5.7,0,0,0-2.18-1c-4.27-1.35-8.68-3.84-10.1-8.09a4.84,4.84,0,0,1-.23-2.71c.65-2.69,4-3.5,6.55-4.47s5-2.63,7.5-3.89,5.4-2.15,8.15-1.51a42.47,42.47,0,0,1,4.11,1.53c4.14,1.44,9.21.77,12.42,3.76a12.83,12.83,0,0,1,3,5.24c2.24,6.22,3.66,13.6-.05,19.06-2.29,3.37-4.51,7.22-8.91,7.63C687.73,535.64,685.7,531,684.89,526.66Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#2f2e41"
                  }
                }),
                _vm._v(" "),
                _c("g", { attrs: { opacity: "0.1" } }, [
                  _c("path", {
                    attrs: {
                      d:
                        "M677.07,520.9c-.39-1.18-.6-2.53-1.52-3.36a5.7,5.7,0,0,0-2.18-1c-4.28-1.35-8.68-3.84-10.11-8.09a4.93,4.93,0,0,1-.22-2.71,3.39,3.39,0,0,1,.53-1.19c-1.63.71-3.05,1.65-3.45,3.31a4.84,4.84,0,0,0,.23,2.71c1.42,4.25,5.83,6.74,10.1,8.09a5.7,5.7,0,0,1,2.18,1c.93.83,1.13,2.17,1.53,3.36s1.28,2.44,2.52,2.38,1.84-1.19,2.63-2.14C678.22,523.12,677.43,522,677.07,520.9Z",
                      transform: "translate(-88.65 -57.09)"
                    }
                  }),
                  _vm._v(" "),
                  _c("path", {
                    attrs: {
                      d:
                        "M695.79,533.06c-5.14.47-7.17-4.21-8-8.52a8.7,8.7,0,0,0-1-3.3,2.78,2.78,0,0,0-3-1.32,5.32,5.32,0,0,0-2.21,2,3,3,0,0,1,2.26,1.4,8.89,8.89,0,0,1,1.06,3.3c.81,4.31,2.84,9,8,8.52a8.25,8.25,0,0,0,5.28-2.74A7.46,7.46,0,0,1,695.79,533.06Z",
                      transform: "translate(-88.65 -57.09)"
                    }
                  })
                ]),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "813.11",
                    cy: "655.78",
                    rx: "32.29",
                    ry: "6.21",
                    fill: "#6c63ff"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "812.57",
                    cy: "653.14",
                    rx: "3.76",
                    ry: "4.92",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "812.57",
                    cy: "647.12",
                    rx: "3.76",
                    ry: "4.92",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "812.57",
                    cy: "641.11",
                    rx: "3.76",
                    ry: "4.92",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "812.57",
                    cy: "635.09",
                    rx: "3.76",
                    ry: "4.92",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "812.57",
                    cy: "629.07",
                    rx: "3.76",
                    ry: "4.92",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "812.57",
                    cy: "623.06",
                    rx: "3.76",
                    ry: "4.92",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "812.57",
                    cy: "617.04",
                    rx: "3.76",
                    ry: "4.92",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M915.29,633a18.19,18.19,0,0,0,1.4-2.06l-9.88-1.62,10.69.07a18.11,18.11,0,0,0,.34-14.27l-14.34,7.44,13.22-9.72A18,18,0,1,0,887,633a17.92,17.92,0,0,0-2.06,3.28l12.83,6.67-13.68-4.59A18,18,0,0,0,887,655.24a18,18,0,1,0,28.31,0,18,18,0,0,0,0-22.27Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#6c63ff"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M883.12,644.1A17.91,17.91,0,0,0,887,655.24a18,18,0,1,0,28.31,0C917.7,652.17,883.12,642.08,883.12,644.1Z",
                    transform: "translate(-88.65 -57.09)",
                    opacity: "0.1"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "148.42",
                    cy: "776.87",
                    rx: "46.49",
                    ry: "8.94",
                    fill: "#6c63ff"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "147.64",
                    cy: "773.07",
                    rx: "5.41",
                    ry: "7.09",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "147.64",
                    cy: "764.41",
                    rx: "5.41",
                    ry: "7.09",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "147.64",
                    cy: "755.75",
                    rx: "5.41",
                    ry: "7.09",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "147.64",
                    cy: "747.09",
                    rx: "5.41",
                    ry: "7.09",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "147.64",
                    cy: "738.43",
                    rx: "5.41",
                    ry: "7.09",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "147.64",
                    cy: "729.76",
                    rx: "5.41",
                    ry: "7.09",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("ellipse", {
                  attrs: {
                    cx: "147.64",
                    cy: "721.1",
                    rx: "5.41",
                    ry: "7.09",
                    fill: "#3f3d56"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M256.55,718.93a27.23,27.23,0,0,0,2-3l-14.22-2.34,15.38.12a26,26,0,0,0,.49-20.55L239.58,703.9l19-14a25.93,25.93,0,1,0-42.83,29,25.83,25.83,0,0,0-3,4.72l18.47,9.6-19.69-6.61A25.93,25.93,0,0,0,215.79,751a25.93,25.93,0,1,0,40.76,0,25.92,25.92,0,0,0,0-32.06Z",
                    transform: "translate(-88.65 -57.09)",
                    fill: "#6c63ff"
                  }
                }),
                _vm._v(" "),
                _c("path", {
                  attrs: {
                    d:
                      "M210.24,735a25.85,25.85,0,0,0,5.55,16,25.93,25.93,0,1,0,40.76,0C260,746.58,210.24,732.05,210.24,735Z",
                    transform: "translate(-88.65 -57.09)",
                    opacity: "0.1"
                  }
                })
              ]
            )
          : _vm._e()
      ])
    : _vm._e()
};
var __vue_staticRenderFns__$c = [];
__vue_render__$c._withStripped = true;

  /* style */
  var __vue_inject_styles__$c = undefined;
  /* scoped */
  var __vue_scope_id__$c = undefined;
  /* module identifier */
  var __vue_module_identifier__$c = undefined;
  /* functional template */
  var __vue_is_functional_template__$c = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$c = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$c, staticRenderFns: __vue_staticRenderFns__$c },
    __vue_inject_styles__$c,
    __vue_script__$c,
    __vue_scope_id__$c,
    __vue_is_functional_template__$c,
    __vue_module_identifier__$c,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$d = {
  name: "AwesomeTable",
  components: {
    "svg-icon": __vue_component__$c,
    popper: __vue_component__$b,
  },
  mixins: [ActionsMixin],
  props: {
    rows: { required: true, default: [] },
    headers: { required: true, default: [] },
    actions: {
      required: false,
      default: function default$1() {
        return [];
      },
    },
    fields: { required: false },
    addResourceClass: { required: false, default: "" },
    headerClass: { required: false, default: "" },
    rowClass: { required: false, default: "" },
    theme: { required: false, default: "green" },
    striped: { required: false, default: true },
    shadow: { required: false, default: true },
    selectable: { required: false, default: false },
    readonly: { required: false, default: false },
    tableClass: {
      required: false,
      type: String,
    },
  },
  data: function data() {
    return {
      defaultAction: null,
      selected_row: null,
      mode: "create",
      resourceToEdit: {},
      resourceToEditValid: false,
      editIndex: null,
      ig_url: "https://instagram.com/p",
      ig_usr_url: "https://instagram.com",
    };
  },
  computed: {
    visibleHeaders: function visibleHeaders() {
      var this$1 = this;

      return this.headers.filter(function (header) {
        if (!header.roles) {
          return true;
        }

        return header.roles.includes(this$1.getUserRole());
      });
    },
  },
  mounted: function mounted() {
    this.defaultAction = this.actions.find(function (a) { return a.default; });
  },
  methods: {
    isObject: isObject,
    getImage: function getImage(obj, header) {
      if (header.type === "image") {
        return this.deepPick(obj, header.field);
      }
      return ((this.ig_url) + "/" + (obj.ig_link.url) + "/media/?size=t");
    },
    getRowClass: function getRowClass(header) {
      // Possible versions:
      // class: "justify-center" => applied to both row and header
      // class: {
      //    row: 'justify-center',
      //    header: 'justify-start'
      // }

      if (header.class && header.class.row) {
        return header.class.row;
      }

      return header.class || "justify-center";
    },
    getHeaderClass: function getHeaderClass(header) {
      // Possible versions:
      // class: "justify-center" => applied to both row and header
      // class: {
      //    row: 'justify-center',
      //    header: 'justify-start'
      // }

      if (header.class && header.class.header) {
        return header.class.header;
      }

      return header.class || "justify-center";
    },
    getSelectedRowClass: function getSelectedRowClass(row) {
      var row_class = "";

      if (this.selectable) {
        row_class += " hover:bg-gray-200 cursor-pointer";
        if (row.id == (this.selected_row ? this.selected_row.id : -1)) {
          row_class += " bg-gray-200";
        }
      }
      return row_class;
    },
    isSelected: function isSelected(row) {
      if (!this.selected_row) { return false; }
      return this.selected_row.id == row.id;
    },
    handleRowClick: function handleRowClick(row, index) {
      if (this.selectable) {
        this.selectRow(row);
        return;
      }

      // If default action, act accordingly
      if (this.defaultAction) {
        this.$emit("act", {
          action: this.defaultAction,
          index: index,
        });
      } else {
        this.$emit("click", index);
      }
    },
    actOnRow: function actOnRow(action, index) {
      if (!this.fields) {
        this.$emit("act", {
          action: action,
          index: index,
        });
        return;
      }

      // We are using the editor right inside the table
      if (this[action.callback]) {
        this[action.callback](index);
      }
    },
    selectRow: function selectRow(row) {
      this.selected_row = row;
      this.$emit("selected", { row: this.selected_row });
    },
    getActionVisibility: function getActionVisibility(action, row) {
      if (!action.visible) {
        return true;
      }

      var negative = action.visible[0] === "!";
      var field = action.visible;

      if (negative) {
        field = action.visible.substring(1, action.visible.length);
      }

      var value = this.deepPick(row, field);

      return negative ? !value : !!value;
    },
    cancelCreation: function cancelCreation() {
      this.resourceToEdit = {};
      this.mode = "create";
      this.editIndex = null;
    },
    canAdd: function canAdd() {
      var this$1 = this;

      var canAdd = true;

      this.fields.forEach(function (field) {
        if (field.validator) {
          field.validator.forEach(function (validator) {
            switch (validator) {
              case "required":
                canAdd = canAdd && !!this$1.resourceToEdit[field.field];
                break;
            }
          });
        }
      });

      return canAdd;
    },
    addRow: function addRow() {
      this.mode = "create";
      this.editIndex = "add";
      this.resourceToEdit = {};
    },
    createNew: function createNew() {
      var new_row = _.clone(this.resourceToEdit);

      this.resourceToEdit = {};

      var rows = _.clone(this.rows);

      if (this.mode != "edit") {
        rows.push(new_row);
      } else {
        rows[this.editIndex] = new_row;
      }

      this.mode = "create";
      this.editIndex = null;

      this.$emit("row-added", rows);
    },
    edit: function edit(index) {
      this.mode = "edit";

      var row = this.rows[index];

      this.resourceToEdit = JSON.parse(JSON.stringify(row));

      this.editIndex = index;
    },
    delete: async function delete$1(index) {
      /*
      let response = await this.$fire({
        title: "Elimina Riga",
        text: "Sei sicuro di voler cancellare questo elemento?",
        type: "question",
        animation: false,
        focusCancel: true,
        confirmButtonColor: "red",
        confirmButtonText: "Elimina",
        cancelButtonText: "Annulla",
        showCancelButton: true,
        reverseButtons: true
      });
      */
      var result = confirm("Sei sicuro di voler cancellare questa riga?");

      if (result) {
        this.rows.splice(index, 1);
      }

      this.$emit("row-deleted", this.rows);
    },
    getPillBgColor: function getPillBgColor(color) {
      if (!color) {
        return "bg-gray-500";
      }
      return color;
    },
  },
};

/* script */
var __vue_script__$d = script$d;

/* template */
var __vue_render__$d = function() {
  var _obj;
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "inline-block min-w-full align-middle" }, [
    _vm.fields && !_vm.readonly
      ? _c("div", { staticClass: "flex flex-row" }, [
          _c(
            "div",
            {
              staticClass: "flex flex-row items-center ml-auto cursor-pointer",
              class: _vm.addResourceClass,
              on: {
                click: function($event) {
                  return _vm.addRow()
                }
              }
            },
            [
              _c("i", { staticClass: "mr-2 ti-plus" }),
              _vm._v(" "),
              _c("span", [_vm._v("Aggiungi")])
            ]
          )
        ])
      : _vm._e(),
    _vm._v(" "),
    _c(
      "table",
      {
        staticClass: "w-full border-collapse table-auto",
        class: _vm.tableClass
      },
      [
        _c("thead", [
          _c(
            "tr",
            { class: ((_obj = {}), (_obj[_vm.headerClass] = true), _obj) },
            [
              _vm._l(_vm.visibleHeaders, function(header, index) {
                return _c(
                  "th",
                  {
                    key: index,
                    staticClass: "px-4 py-3 font-semibold text-md",
                    class: [_vm.getHeaderClass(header)]
                  },
                  [
                    _c(
                      "div",
                      {
                        staticClass: "flex flex-row",
                        class: _vm.getHeaderClass(header)
                      },
                      [
                        _vm._v(
                          "\n            " +
                            _vm._s(_vm._f("translate")(header.label)) +
                            "\n          "
                        )
                      ]
                    )
                  ]
                )
              }),
              _vm._v(" "),
              _vm.actions.length || _vm.selectable
                ? _c("th", { staticClass: "px-4 py-3 font-semibold text-md" }, [
                    _c(
                      "div",
                      {
                        staticClass: "flex flex-row justify-center",
                        class: _vm.headerClass
                      },
                      [_vm._v("\n            Azioni\n          ")]
                    )
                  ])
                : _vm._e()
            ],
            2
          )
        ]),
        _vm._v(" "),
        _c(
          "tbody",
          [
            _vm._l(_vm.rows, function(row, index) {
              return [
                _c(
                  "tr",
                  {
                    key: index,
                    staticClass: "cursor-pointer",
                    class: _vm.rowClass,
                    on: {
                      click: function($event) {
                        return _vm.handleRowClick(row, index)
                      }
                    }
                  },
                  [
                    _vm._l(_vm.visibleHeaders, function(header, index) {
                      return _c(
                        "td",
                        { key: index, staticClass: "px-4 py-4" },
                        [
                          _c(
                            "div",
                            {
                              staticClass:
                                "flex flex-row items-center h-full text-gray-dark",
                              class: _vm.getRowClass(header)
                            },
                            [
                              header.type == "avatar"
                                ? _c(
                                    "div",
                                    {
                                      staticClass: "flex flex-row items-center"
                                    },
                                    [
                                      _c("img", {
                                        staticClass:
                                          "\n                    w-12\n                    h-12\n                    mr-4\n                    bg-gray-400 bg-no-repeat bg-auto\n                    rounded-full\n                  ",
                                        attrs: {
                                          src: _vm.deepPick(
                                            row,
                                            header.fields.image
                                          )
                                        }
                                      }),
                                      _vm._v(" "),
                                      _c(
                                        "div",
                                        { staticClass: "flex flex-col" },
                                        [
                                          _c(
                                            "div",
                                            {
                                              staticClass:
                                                "flex flex-row items-center mb-1"
                                            },
                                            [
                                              _c(
                                                "a",
                                                {
                                                  staticClass:
                                                    "mr-2 text-base text-blue-500 hover:text-blue-600",
                                                  attrs: {
                                                    target: "_blank",
                                                    href:
                                                      _vm.ig_usr_url +
                                                      "/" +
                                                      _vm.deepPick(
                                                        row,
                                                        header.fields.title
                                                      )
                                                  }
                                                },
                                                [
                                                  _vm._v(
                                                    _vm._s(
                                                      _vm.deepPick(
                                                        row,
                                                        header.fields.title
                                                      )
                                                    )
                                                  )
                                                ]
                                              ),
                                              _vm._v(" "),
                                              _vm.deepPick(
                                                row,
                                                "usr.is_verified"
                                              )
                                                ? _c(
                                                    "span",
                                                    { staticClass: "w-4 h-4" },
                                                    [
                                                      _c("svg-icon", {
                                                        attrs: {
                                                          name:
                                                            "verified-badge",
                                                          width: "w-4",
                                                          height: "h-4"
                                                        }
                                                      })
                                                    ],
                                                    1
                                                  )
                                                : _vm._e(),
                                              _vm._v(" "),
                                               _vm._e()
                                            ]
                                          ),
                                          _vm._v(" "),
                                          _c(
                                            "div",
                                            {
                                              staticClass:
                                                "text-xs text-gray-500"
                                            },
                                            [
                                              _vm._v(
                                                "\n                    " +
                                                  _vm._s(
                                                    _vm.deepPick(
                                                      row,
                                                      header.fields.description
                                                    )
                                                  ) +
                                                  "\n                  "
                                              )
                                            ]
                                          )
                                        ]
                                      )
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "image" ||
                              header.type == "ig-media"
                                ? _c(
                                    "div",
                                    {
                                      staticClass:
                                        "flex flex-row items-center justify-center flex-grow"
                                    },
                                    [
                                      _c("img", {
                                        staticClass:
                                          "\n                    object-cover\n                    w-10\n                    h-10\n                    bg-gray-400 bg-no-repeat bg-auto\n                    rounded-lg\n                  ",
                                        attrs: {
                                          src: _vm.getImage(row, header.field)
                                        }
                                      })
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "link"
                                ? _c(
                                    "div",
                                    { staticClass: "flex flex-row items-end" },
                                    [
                                      _c(
                                        "a",
                                        {
                                          staticClass:
                                            "px-4 py-2 text-white bg-blue-500 btn rounded-md",
                                          attrs: {
                                            target: "_blank",
                                            href:
                                              "https://www.instagram.com/p/" +
                                              _vm.deepPick(
                                                row,
                                                header.fields.url_link
                                              )
                                          }
                                        },
                                        [
                                          _vm._v(
                                            _vm._s(
                                              _vm._f("translate")(
                                                _vm.deepPick(
                                                  row,
                                                  header.fields.url_name
                                                )
                                              )
                                            )
                                          )
                                        ]
                                      )
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "tag"
                                ? _c(
                                    "div",
                                    { staticClass: "flex flex-row items-end" },
                                    [
                                      _c("span", [
                                        _vm._v(
                                          _vm._s(
                                            _vm.deepPick(row, header.field)
                                              .length || 0
                                          )
                                        )
                                      ])
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "timeago"
                                ? _c(
                                    "div",
                                    {
                                      staticClass: "flex flex-row items-center"
                                    },
                                    [
                                      _c("span", {}, [
                                        _vm._v(
                                          _vm._s(
                                            _vm._f("time_ago")(
                                              _vm.deepPick(row, header.field)
                                            )
                                          )
                                        )
                                      ])
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "date"
                                ? _c(
                                    "div",
                                    {
                                      staticClass: "flex flex-row items-center"
                                    },
                                    [
                                      _c("span", {}, [
                                        _vm._v(
                                          _vm._s(
                                            _vm._f("date")(
                                              _vm.deepPick(row, header.field),
                                              header.dateFormat
                                            )
                                          )
                                        )
                                      ])
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "time"
                                ? _c(
                                    "div",
                                    {
                                      staticClass: "flex flex-row items-center"
                                    },
                                    [
                                      _c("span", [
                                        _vm._v(
                                          _vm._s(
                                            _vm.deepPick(row, header.field)
                                          )
                                        )
                                      ])
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "text"
                                ? _c(
                                    "div",
                                    { staticClass: "flex flex-row items-end" },
                                    [
                                      _vm.deepPick(
                                        row,
                                        header.field,
                                        header.type
                                      )
                                        ? _c("span", { class: header.class }, [
                                            _vm._v(
                                              "\n                  " +
                                                _vm._s(
                                                  _vm.deepPick(
                                                    row,
                                                    header.field,
                                                    header.type
                                                  )
                                                ) +
                                                "\n                "
                                            )
                                          ])
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _c("span", [
                                        _vm._v(_vm._s(header.on_empty))
                                      ])
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "username"
                                ? _c(
                                    "div",
                                    { staticClass: "flex flex-row items-end" },
                                    [
                                      _c(
                                        "a",
                                        {
                                          staticClass:
                                            "mr-2 text-base text-blue-500 hover:text-blue-600",
                                          class: header.class,
                                          attrs: {
                                            target: "_blank",
                                            href:
                                              _vm.ig_usr_url +
                                              "/" +
                                              _vm.deepPick(row, "user.username")
                                          }
                                        },
                                        [
                                          _vm._v(
                                            _vm._s(
                                              _vm.deepPick(row, "user.username")
                                            )
                                          )
                                        ]
                                      )
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "number"
                                ? _c(
                                    "div",
                                    { staticClass: "flex flex-row items-end" },
                                    [
                                      _vm.deepPick(
                                        row,
                                        header.field,
                                        header.type
                                      )
                                        ? _c("span", { class: header.class }, [
                                            _vm._v(
                                              "\n                  " +
                                                _vm._s(
                                                  _vm._f("size_number")(
                                                    _vm.deepPick(
                                                      row,
                                                      header.field,
                                                      header.type
                                                    )
                                                  )
                                                ) +
                                                "\n                  "
                                            ),
                                            header.udm
                                              ? _c(
                                                  "span",
                                                  {
                                                    class:
                                                      header.udm.class || ""
                                                  },
                                                  [
                                                    _vm._v(
                                                      _vm._s(
                                                        _vm.isObject(header.udm)
                                                          ? _vm.deepPick(
                                                              row,
                                                              header.udm.code
                                                            )
                                                          : header.udm
                                                      )
                                                    )
                                                  ]
                                                )
                                              : _vm._e()
                                          ])
                                        : _c(
                                            "span",
                                            { staticClass: "text-gray-400" },
                                            [_vm._v(_vm._s(header.on_empty))]
                                          )
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "hashtag"
                                ? _c(
                                    "div",
                                    { staticClass: "flex flex-row items-end" },
                                    [
                                      _c(
                                        "span",
                                        {
                                          staticClass:
                                            "font-medium text-blue-700 underline cursor-pointer"
                                        },
                                        [
                                          _vm._v(
                                            "#" +
                                              _vm._s(
                                                _vm.deepPick(row, header.field)
                                              )
                                          )
                                        ]
                                      )
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "details"
                                ? [
                                    _c(
                                      "div",
                                      { staticClass: "flex flex-col" },
                                      [
                                        _c(
                                          "div",
                                          { staticClass: "mb-1 text-base" },
                                          [
                                            _vm._v(
                                              "\n                    " +
                                                _vm._s(
                                                  _vm.deepPick(
                                                    row,
                                                    header.field.title
                                                  )
                                                ) +
                                                "\n                  "
                                            )
                                          ]
                                        ),
                                        _vm._v(" "),
                                        _c(
                                          "div",
                                          {
                                            staticClass: "text-xs text-gray-500"
                                          },
                                          [
                                            _vm._v(
                                              "\n                    " +
                                                _vm._s(
                                                  _vm.deepPick(
                                                    row,
                                                    header.field.description
                                                  )
                                                ) +
                                                "\n                  "
                                            )
                                          ]
                                        )
                                      ]
                                    )
                                  ]
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "stock"
                                ? [
                                    _c(
                                      "div",
                                      { staticClass: "flex flex-row" },
                                      [
                                        _c(
                                          "span",
                                          {
                                            staticClass: "text-base font-bold"
                                          },
                                          [
                                            _vm._v(
                                              _vm._s(
                                                _vm.deepPick(
                                                  row,
                                                  header.fields.current_value
                                                )
                                              )
                                            )
                                          ]
                                        ),
                                        _vm._v(" "),
                                        _c(
                                          "div",
                                          {
                                            staticClass: "ml-2",
                                            class:
                                              _vm.deepPick(
                                                row,
                                                header.fields.flow
                                              ) == "plus"
                                                ? "text--600"
                                                : "text-red-500"
                                          },
                                          [
                                            _c("i", {
                                              staticClass: "mx-1",
                                              class:
                                                _vm.deepPick(
                                                  row,
                                                  header.fields.flow
                                                ) == "plus"
                                                  ? "hi-trending-up"
                                                  : "hi-trending-down"
                                            }),
                                            _vm._v(" "),
                                            _c("span", [
                                              _vm._v(
                                                _vm._s(
                                                  _vm.deepPick(
                                                    row,
                                                    header.fields.trend
                                                  )
                                                ) + "%"
                                              )
                                            ])
                                          ]
                                        )
                                      ]
                                    )
                                  ]
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "count"
                                ? [
                                    _c("div", {}, [
                                      _vm._v(
                                        "\n                  " +
                                          _vm._s(
                                            _vm._f("count")(
                                              _vm.deepPick(row, header.field)
                                            )
                                          ) +
                                          "\n                "
                                      )
                                    ])
                                  ]
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "recursivity-picker"
                                ? _c(
                                    "div",
                                    [
                                      _c("recursivity-view", {
                                        attrs: {
                                          week: _vm.deepPick(row, header.field)
                                        }
                                      })
                                    ],
                                    1
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "pill"
                                ? _c(
                                    "div",
                                    {
                                      staticClass:
                                        "flex flex-row items-center h-full"
                                    },
                                    [
                                      _c(
                                        "span",
                                        {
                                          staticClass:
                                            "px-3 py-1 text-xs rounded-lg",
                                          class: [
                                            _vm.getPillBgColor(
                                              _vm.deepPick(
                                                row,
                                                header.field.color
                                              )
                                            ),
                                            _vm.deepPick(
                                              row,
                                              header.field.text_color
                                            ) || "text-white"
                                          ]
                                        },
                                        [
                                          _vm._v(
                                            _vm._s(
                                              _vm.deepPick(
                                                row,
                                                header.field.text
                                              )
                                            )
                                          )
                                        ]
                                      )
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "friendship"
                                ? _c(
                                    "div",
                                    {
                                      staticClass:
                                        "\n                  flex flex-row\n                  justify-center\n                  h-full\n                  w-full\n                  items-center\n                "
                                    },
                                    [
                                      _c("span", {
                                        staticClass: "rounded-full h-5 w-5",
                                        class: _vm.deepPick(row, header.field)
                                          ? "bg-green-300"
                                          : "bg-gray-200"
                                      })
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "boolean"
                                ? _c(
                                    "div",
                                    {
                                      staticClass:
                                        "\n                  flex flex-row\n                  justify-center\n                  h-full\n                  w-full\n                  items-center\n                "
                                    },
                                    [
                                      _c("span", {
                                        staticClass: "rounded-full h-5 w-5",
                                        class: _vm.deepPick(row, header.field)
                                          ? "bg-green-300"
                                          : "bg-red-300"
                                      })
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "partnership"
                                ? _c(
                                    "div",
                                    {
                                      staticClass:
                                        "flex flex-row items-center h-full"
                                    },
                                    [
                                      _c("div", {
                                        staticClass: "w-5 h-5 rounded-full",
                                        class: _vm.deepPick(row, header.field)
                                          ? "bg-green-400"
                                          : ""
                                      })
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "status"
                                ? _c(
                                    "div",
                                    {
                                      staticClass:
                                        "h-full w-full flex flex-col items-center"
                                    },
                                    [
                                      _c("div", {
                                        staticClass:
                                          "w-5 h-5 rounded-full bg-gray-400",
                                        class: {
                                          "bg-green-400": row.isActive,
                                          "bg-red-400": !row.isActive
                                        }
                                      })
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "percentage"
                                ? _c(
                                    "div",
                                    {
                                      staticClass:
                                        "h-full w-full flex flex-col items-center"
                                    },
                                    [
                                      _vm._v(
                                        "\n                " +
                                          _vm._s(
                                            _vm._f("percentage")(
                                              _vm.deepPick(row, header.field)
                                            )
                                          ) +
                                          "\n              "
                                      )
                                    ]
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.type == "horizontalpiechart"
                                ? _c(
                                    "div",
                                    {
                                      staticClass:
                                        "h-full w-full flex flex-col items-center"
                                    },
                                    [
                                      _c("horizontal-pie-chart", {
                                        attrs: {
                                          values: header.values,
                                          elem: row
                                        }
                                      })
                                    ],
                                    1
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              _vm.$viewFields[header.type]
                                ? _c(
                                    "div",
                                    [
                                      _c(_vm.$viewFields[header.type], {
                                        tag: "component",
                                        attrs: {
                                          context: header.context,
                                          field: _vm.deepPick(row, header.field)
                                        }
                                      })
                                    ],
                                    1
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              header.field == "actions"
                                ? _c(
                                    "div",
                                    {
                                      staticClass:
                                        "h-full flex flex-col items-end"
                                    },
                                    [
                                      _c("div", {
                                        staticClass:
                                          "\n                    flex-grow flex flex-row\n                    justify-center\n                    items-center\n                    transition-all\n                    duration-75\n                    ease-in\n                  "
                                      })
                                    ]
                                  )
                                : _vm._e()
                            ],
                            2
                          )
                        ]
                      )
                    }),
                    _vm._v(" "),
                    _vm.actions.length || _vm.selectable
                      ? _c(
                          "td",
                          {
                            staticClass: "px-6 py-4 whitespace-no-wrap",
                            staticStyle: { width: "20%" }
                          },
                          [
                            !_vm.selectable
                              ? _c(
                                  "div",
                                  {
                                    staticClass:
                                      "flex flex-row items-center justify-center"
                                  },
                                  [
                                    _vm._l(_vm.actions, function(action) {
                                      return [
                                        _vm.isActionVisible(action, row)
                                          ? _c(
                                              "popper",
                                              {
                                                key: action.name,
                                                attrs: { trigger: "hover" }
                                              },
                                              [
                                                _c(
                                                  "div",
                                                  {
                                                    staticClass:
                                                      "\n                      popper\n                      shadow-md\n                      bg-white\n                      text-gray-700\n                      rounded\n                      py-1\n                      px-2\n                    "
                                                  },
                                                  [
                                                    _vm._v(
                                                      "\n                    " +
                                                        _vm._s(action.label) +
                                                        "\n                  "
                                                    )
                                                  ]
                                                ),
                                                _vm._v(" "),
                                                _c("icon", {
                                                  staticClass:
                                                    "mr-1 focus:outline-none p-1",
                                                  class: action.class,
                                                  attrs: {
                                                    slot: "reference",
                                                    name: action.icon,
                                                    size: "l",
                                                    color: "text-gray-500",
                                                    "stop-propagation": true
                                                  },
                                                  on: {
                                                    click: function($event) {
                                                      return _vm.actOnRow(
                                                        action,
                                                        index
                                                      )
                                                    }
                                                  },
                                                  slot: "reference"
                                                })
                                              ],
                                              1
                                            )
                                          : _vm._e()
                                      ]
                                    })
                                  ],
                                  2
                                )
                              : _c(
                                  "div",
                                  {
                                    staticClass:
                                      "flex flex-row items-center justify-center"
                                  },
                                  [
                                    _c("div", {
                                      staticClass:
                                        "\n                  rounded-full\n                  h-6\n                  w-6\n                  flex flex-row\n                  items-center\n                  justify-center\n                  hover:bg-gray-700\n                  text-white\n                  border-2 border-gray-700\n                ",
                                      class: _vm.isSelected(row)
                                        ? "bg-gray-700 tx-white"
                                        : "bg-white",
                                      on: {
                                        click: function($event) {
                                          return _vm.selectRow(row)
                                        }
                                      }
                                    })
                                  ]
                                )
                          ]
                        )
                      : _vm._e()
                  ],
                  2
                ),
                _vm._v(" "),
                _vm.editIndex == index
                  ? _c("tr", { key: "0_" + index }, [
                      _c("td", { attrs: { colspan: _vm.headers.length + 2 } }, [
                        !_vm.readonly && _vm.fields
                          ? _c(
                              "div",
                              { staticClass: "bg-blue-light p-5 my-2" },
                              [
                                _c("awesome-form", {
                                  attrs: {
                                    form: _vm.resourceToEdit,
                                    is_edit: true,
                                    headers: _vm.fields,
                                    validate: true
                                  },
                                  on: {
                                    "update:form": function($event) {
                                      _vm.resourceToEdit = $event;
                                    },
                                    valid: function(_valid) {
                                      return (_vm.resourceToEditValid = _valid)
                                    },
                                    change: function(_resource) {
                                      return (_vm.resourceToEdit = _resource)
                                    }
                                  }
                                }),
                                _vm._v(" "),
                                _c(
                                  "div",
                                  { staticClass: "flex flex-row w-full mt-5" },
                                  [
                                    _c("div", { staticClass: "ml-auto" }, [
                                      _c(
                                        "button",
                                        {
                                          directives: [
                                            {
                                              name: "show",
                                              rawName: "v-show",
                                              value: _vm.mode == "edit",
                                              expression: "mode == 'edit'"
                                            }
                                          ],
                                          staticClass:
                                            "\n                      btn\n                      bg-transparent\n                      text-gray-600\n                      mr-3\n                      active:outline-none\n                      focus:outline-none\n                      hover:text-gray-800\n                    ",
                                          on: {
                                            click: function($event) {
                                              return _vm.cancelCreation()
                                            }
                                          }
                                        },
                                        [
                                          _vm._v(
                                            "\n                    Annulla\n                  "
                                          )
                                        ]
                                      ),
                                      _vm._v(" "),
                                      _c(
                                        "button",
                                        {
                                          staticClass:
                                            "\n                      bg-blue\n                      text-white\n                      disabled:bg-gray-light\n                      disabled:text-gray\n                      disabled:cursor-not-allowed\n                      focus:outline-none\n                    ",
                                          attrs: {
                                            disabled: !_vm.resourceToEditValid
                                          },
                                          on: {
                                            click: function($event) {
                                              return _vm.createNew()
                                            }
                                          }
                                        },
                                        [
                                          _vm._v(
                                            "\n                    " +
                                              _vm._s(
                                                _vm.mode == "edit"
                                                  ? "Salva"
                                                  : "Aggiungi"
                                              ) +
                                              "\n                  "
                                          )
                                        ]
                                      )
                                    ])
                                  ]
                                )
                              ],
                              1
                            )
                          : _vm._e(),
                        _vm._v(" "),
                        _vm.fields && !_vm.readonly
                          ? _c("div", { staticClass: "flex flex-row" })
                          : _vm._e()
                      ])
                    ])
                  : _vm._e()
              ]
            }),
            _vm._v(" "),
            _vm.editIndex == "add"
              ? _c("tr", [
                  _c("td", { attrs: { colspan: _vm.headers.length + 2 } }, [
                    !_vm.readonly && _vm.fields
                      ? _c(
                          "div",
                          { staticClass: "bg-blue-light p-5 my-2" },
                          [
                            _c("awesome-form", {
                              attrs: {
                                form: _vm.resourceToEdit,
                                is_edit: false,
                                headers: _vm.fields,
                                validate: true
                              },
                              on: {
                                "update:form": function($event) {
                                  _vm.resourceToEdit = $event;
                                },
                                valid: function(_valid) {
                                  return (_vm.resourceToEditValid = _valid)
                                },
                                change: function(_resource) {
                                  return (_vm.resourceToEdit = _resource)
                                }
                              }
                            }),
                            _vm._v(" "),
                            _c(
                              "div",
                              { staticClass: "flex flex-row w-full mt-5" },
                              [
                                _c("div", { staticClass: "ml-auto" }, [
                                  _c(
                                    "button",
                                    {
                                      staticClass:
                                        "\n                    btn\n                    bg-transparent\n                    text-gray-600\n                    mr-3\n                    active:outline-none\n                    focus:outline-none\n                    hover:text-gray-800\n                  ",
                                      on: {
                                        click: function($event) {
                                          return _vm.cancelCreation()
                                        }
                                      }
                                    },
                                    [
                                      _vm._v(
                                        "\n                  Annulla\n                "
                                      )
                                    ]
                                  ),
                                  _vm._v(" "),
                                  _c(
                                    "button",
                                    {
                                      staticClass:
                                        "\n                    bg-blue\n                    text-white\n                    disabled:bg-gray-light\n                    disabled:text-gray\n                    disabled:cursor-not-allowed\n                    focus:outline-none\n                  ",
                                      attrs: {
                                        disabled: !_vm.resourceToEditValid
                                      },
                                      on: {
                                        click: function($event) {
                                          return _vm.createNew()
                                        }
                                      }
                                    },
                                    [
                                      _vm._v(
                                        "\n                  " +
                                          _vm._s(
                                            _vm.mode == "edit"
                                              ? "Salva"
                                              : "Aggiungi"
                                          ) +
                                          "\n                "
                                      )
                                    ]
                                  )
                                ])
                              ]
                            )
                          ],
                          1
                        )
                      : _vm._e()
                  ])
                ])
              : _vm._e(),
            _vm._v(" "),
            !_vm.rows || _vm.rows.length == 0
              ? _c("tr", [
                  _c(
                    "td",
                    { attrs: { colspan: _vm.headers.length + 2 } },
                    [
                      _vm._t("no-data", function() {
                        return [
                          _c(
                            "div",
                            {
                              staticClass:
                                "\n                text-center text-gray\n                font-bold\n                text-md\n                font-semibold\n                bg-white\n                py-5\n              "
                            },
                            [
                              _vm._v(
                                "\n              Nessuna riga da mostrare\n            "
                              )
                            ]
                          )
                        ]
                      })
                    ],
                    2
                  )
                ])
              : _vm._e()
          ],
          2
        )
      ]
    )
  ])
};
var __vue_staticRenderFns__$d = [];
__vue_render__$d._withStripped = true;

  /* style */
  var __vue_inject_styles__$d = function (inject) {
    if (!inject) { return }
    inject("data-v-2b570681_0", { source: "\n.select-circle {\n  height: 20px;\n  width: 20px;\n  border-radius: 50%;\n  border: 1px solid var(--primary);\n  transition: 0.2s ease-in-out;\n}\n.select-circle:hover {\n  background-color: var(--primary);\n}\n.select-circle.selected {\n  background-color: var(--primary);\n}\n", map: {"version":3,"sources":["/app/estia/src/components/AwesomeTable.vue"],"names":[],"mappings":";AA+yBA;EACA,YAAA;EACA,WAAA;EACA,kBAAA;EACA,gCAAA;EACA,4BAAA;AACA;AAEA;EACA,gCAAA;AACA;AAEA;EACA,gCAAA;AACA","file":"AwesomeTable.vue","sourcesContent":["<template>\n  <div class=\"inline-block min-w-full align-middle\">\n    <div v-if=\"fields && !readonly\" class=\"flex flex-row\">\n      <div\n        :class=\"addResourceClass\"\n        class=\"flex flex-row items-center ml-auto cursor-pointer\"\n        @click=\"addRow()\"\n      >\n        <i class=\"mr-2 ti-plus\" />\n        <span>Aggiungi</span>\n      </div>\n    </div>\n    <table class=\"w-full border-collapse table-auto\" :class=\"tableClass\">\n      <thead>\n        <tr\n          :class=\"{\n            [headerClass]: true,\n          }\"\n        >\n          <th\n            v-for=\"(header, index) in visibleHeaders\"\n            :key=\"index\"\n            :class=\"[getHeaderClass(header)]\"\n            class=\"px-4 py-3 font-semibold text-md\"\n          >\n            <div class=\"flex flex-row\" :class=\"getHeaderClass(header)\">\n              {{ header.label | translate }}\n            </div>\n          </th>\n          <th\n            v-if=\"actions.length || selectable\"\n            class=\"px-4 py-3 font-semibold text-md\"\n          >\n            <div class=\"flex flex-row justify-center\" :class=\"headerClass\">\n              Azioni\n            </div>\n          </th>\n        </tr>\n      </thead>\n      <tbody>\n        <template v-for=\"(row, index) in rows\">\n          <tr\n            :key=\"index\"\n            class=\"cursor-pointer\"\n            :class=\"rowClass\"\n            @click=\"handleRowClick(row, index)\"\n          >\n            <td\n              v-for=\"(header, index) in visibleHeaders\"\n              :key=\"index\"\n              class=\"px-4 py-4\"\n            >\n              <div\n                class=\"flex flex-row items-center h-full text-gray-dark\"\n                :class=\"getRowClass(header)\"\n              >\n                <div\n                  v-if=\"header.type == 'avatar'\"\n                  class=\"flex flex-row items-center\"\n                >\n                  <img\n                    :src=\"deepPick(row, header.fields.image)\"\n                    class=\"\n                      w-12\n                      h-12\n                      mr-4\n                      bg-gray-400 bg-no-repeat bg-auto\n                      rounded-full\n                    \"\n                  />\n                  <div class=\"flex flex-col\">\n                    <div class=\"flex flex-row items-center mb-1\">\n                      <a\n                        target=\"_blank\"\n                        :href=\"\n                          ig_usr_url + '/' + deepPick(row, header.fields.title)\n                        \"\n                        class=\"mr-2 text-base text-blue-500 hover:text-blue-600\"\n                        >{{ deepPick(row, header.fields.title) }}</a\n                      >\n                      <span\n                        v-if=\"deepPick(row, 'usr.is_verified')\"\n                        class=\"w-4 h-4\"\n                      >\n                        <svg-icon\n                          name=\"verified-badge\"\n                          width=\"w-4\"\n                          height=\"h-4\"\n                        />\n                      </span>\n                      <span v-if=\"false\" class=\"w-4 h-4\">\n                        <svg-icon\n                          name=\"friendship-badge\"\n                          width=\"w-4\"\n                          height=\"h-4\"\n                          class=\"bg-blue-400\"\n                        />\n                      </span>\n                    </div>\n                    <div class=\"text-xs text-gray-500\">\n                      {{ deepPick(row, header.fields.description) }}\n                    </div>\n                  </div>\n                </div>\n\n                <div\n                  v-if=\"header.type == 'image' || header.type == 'ig-media'\"\n                  class=\"flex flex-row items-center justify-center flex-grow\"\n                >\n                  <img\n                    :src=\"getImage(row, header.field)\"\n                    class=\"\n                      object-cover\n                      w-10\n                      h-10\n                      bg-gray-400 bg-no-repeat bg-auto\n                      rounded-lg\n                    \"\n                  />\n                </div>\n\n                <div\n                  v-if=\"header.type == 'link'\"\n                  class=\"flex flex-row items-end\"\n                >\n                  <a\n                    class=\"px-4 py-2 text-white bg-blue-500 btn rounded-md\"\n                    target=\"_blank\"\n                    :href=\"\n                      'https://www.instagram.com/p/' +\n                      deepPick(row, header.fields.url_link)\n                    \"\n                    >{{ deepPick(row, header.fields.url_name) | translate }}</a\n                  >\n                </div>\n\n                <div\n                  v-if=\"header.type == 'tag'\"\n                  class=\"flex flex-row items-end\"\n                >\n                  <span>{{ deepPick(row, header.field).length || 0 }}</span>\n                </div>\n\n                <div\n                  v-if=\"header.type == 'timeago'\"\n                  class=\"flex flex-row items-center\"\n                >\n                  <span class>{{\n                    deepPick(row, header.field) | time_ago\n                  }}</span>\n                </div>\n\n                <div\n                  v-if=\"header.type == 'date'\"\n                  class=\"flex flex-row items-center\"\n                >\n                  <span class>{{\n                    deepPick(row, header.field) | date(header.dateFormat)\n                  }}</span>\n                </div>\n\n                <div\n                  v-if=\"header.type == 'time'\"\n                  class=\"flex flex-row items-center\"\n                >\n                  <span>{{ deepPick(row, header.field) }}</span>\n                </div>\n\n                <div\n                  v-if=\"header.type == 'text'\"\n                  class=\"flex flex-row items-end\"\n                >\n                  <span\n                    :class=\"header.class\"\n                    v-if=\"deepPick(row, header.field, header.type)\"\n                  >\n                    {{ deepPick(row, header.field, header.type) }}\n                  </span>\n                  <span>{{ header.on_empty }}</span>\n                </div>\n\n                <div\n                  v-if=\"header.type == 'username'\"\n                  class=\"flex flex-row items-end\"\n                >\n                  <a\n                    target=\"_blank\"\n                    :href=\"ig_usr_url + '/' + deepPick(row, 'user.username')\"\n                    class=\"mr-2 text-base text-blue-500 hover:text-blue-600\"\n                    :class=\"header.class\"\n                    >{{ deepPick(row, \"user.username\") }}</a\n                  >\n                </div>\n\n                <div\n                  v-if=\"header.type == 'number'\"\n                  class=\"flex flex-row items-end\"\n                >\n                  <span\n                    :class=\"header.class\"\n                    v-if=\"deepPick(row, header.field, header.type)\"\n                  >\n                    {{ deepPick(row, header.field, header.type) | size_number }}\n                    <span v-if=\"header.udm\" :class=\"header.udm.class || ''\">{{\n                      isObject(header.udm)\n                        ? deepPick(row, header.udm.code)\n                        : header.udm\n                    }}</span>\n                  </span>\n                  <span v-else class=\"text-gray-400\">{{\n                    header.on_empty\n                  }}</span>\n                </div>\n\n                <div\n                  v-if=\"header.type == 'hashtag'\"\n                  class=\"flex flex-row items-end\"\n                >\n                  <span\n                    class=\"font-medium text-blue-700 underline cursor-pointer\"\n                    >#{{ deepPick(row, header.field) }}</span\n                  >\n                </div>\n\n                <template v-if=\"header.type == 'details'\">\n                  <div class=\"flex flex-col\">\n                    <div class=\"mb-1 text-base\">\n                      {{ deepPick(row, header.field.title) }}\n                    </div>\n                    <div class=\"text-xs text-gray-500\">\n                      {{ deepPick(row, header.field.description) }}\n                    </div>\n                  </div>\n                </template>\n\n                <template v-if=\"header.type == 'stock'\">\n                  <div class=\"flex flex-row\">\n                    <span class=\"text-base font-bold\">{{\n                      deepPick(row, header.fields.current_value)\n                    }}</span>\n                    <div\n                      class=\"ml-2\"\n                      :class=\"\n                        deepPick(row, header.fields.flow) == 'plus'\n                          ? 'text--600'\n                          : 'text-red-500'\n                      \"\n                    >\n                      <i\n                        class=\"mx-1\"\n                        :class=\"\n                          deepPick(row, header.fields.flow) == 'plus'\n                            ? 'hi-trending-up'\n                            : 'hi-trending-down'\n                        \"\n                      />\n                      <span>{{ deepPick(row, header.fields.trend) }}%</span>\n                    </div>\n                  </div>\n                </template>\n\n                <template v-if=\"header.type == 'count'\">\n                  <div class>\n                    {{ deepPick(row, header.field) | count }}\n                  </div>\n                </template>\n\n                <div v-if=\"header.type == 'recursivity-picker'\">\n                  <recursivity-view :week=\"deepPick(row, header.field)\" />\n                </div>\n\n                <div\n                  v-if=\"header.type == 'pill'\"\n                  class=\"flex flex-row items-center h-full\"\n                >\n                  <span\n                    class=\"px-3 py-1 text-xs rounded-lg\"\n                    :class=\"[\n                      getPillBgColor(deepPick(row, header.field.color)),\n                      deepPick(row, header.field.text_color) || 'text-white',\n                    ]\"\n                    >{{ deepPick(row, header.field.text) }}</span\n                  >\n                </div>\n\n                <div\n                  v-if=\"header.type == 'friendship'\"\n                  class=\"\n                    flex flex-row\n                    justify-center\n                    h-full\n                    w-full\n                    items-center\n                  \"\n                >\n                  <span\n                    class=\"rounded-full h-5 w-5\"\n                    :class=\"\n                      deepPick(row, header.field)\n                        ? 'bg-green-300'\n                        : 'bg-gray-200'\n                    \"\n                  />\n                </div>\n\n                <div\n                  v-if=\"header.type == 'boolean'\"\n                  class=\"\n                    flex flex-row\n                    justify-center\n                    h-full\n                    w-full\n                    items-center\n                  \"\n                >\n                  <span\n                    class=\"rounded-full h-5 w-5\"\n                    :class=\"\n                      deepPick(row, header.field)\n                        ? 'bg-green-300'\n                        : 'bg-red-300'\n                    \"\n                  />\n                </div>\n\n                <div\n                  v-if=\"header.type == 'partnership'\"\n                  class=\"flex flex-row items-center h-full\"\n                >\n                  <div\n                    class=\"w-5 h-5 rounded-full\"\n                    :class=\"deepPick(row, header.field) ? 'bg-green-400' : ''\"\n                  />\n                </div>\n\n                <div\n                  v-if=\"header.type == 'status'\"\n                  class=\"h-full w-full flex flex-col items-center\"\n                >\n                  <div\n                    :class=\"{\n                      'bg-green-400': row.isActive,\n                      'bg-red-400': !row.isActive,\n                    }\"\n                    class=\"w-5 h-5 rounded-full bg-gray-400\"\n                  />\n                </div>\n                <div\n                  v-if=\"header.type == 'percentage'\"\n                  class=\"h-full w-full flex flex-col items-center\"\n                >\n                  {{ deepPick(row, header.field) | percentage }}\n                </div>\n                <div\n                  v-if=\"header.type == 'horizontalpiechart'\"\n                  class=\"h-full w-full flex flex-col items-center\"\n                >\n                  <horizontal-pie-chart :values=\"header.values\" :elem=\"row\" />\n                </div>\n\n                <div v-if=\"$viewFields[header.type]\">\n                  <component\n                    :is=\"$viewFields[header.type]\"\n                    :context=\"header.context\"\n                    :field=\"deepPick(row, header.field)\"\n                  />\n                </div>\n\n                <div\n                  v-if=\"header.field == 'actions'\"\n                  class=\"h-full flex flex-col items-end\"\n                >\n                  <div\n                    class=\"\n                      flex-grow flex flex-row\n                      justify-center\n                      items-center\n                      transition-all\n                      duration-75\n                      ease-in\n                    \"\n                  />\n                </div>\n              </div>\n            </td>\n            <td\n              v-if=\"actions.length || selectable\"\n              style=\"width: 20%\"\n              class=\"px-6 py-4 whitespace-no-wrap\"\n            >\n              <div\n                v-if=\"!selectable\"\n                class=\"flex flex-row items-center justify-center\"\n              >\n                <template v-for=\"action in actions\">\n                  <popper\n                    v-if=\"isActionVisible(action, row)\"\n                    :key=\"action.name\"\n                    trigger=\"hover\"\n                  >\n                    <div\n                      class=\"\n                        popper\n                        shadow-md\n                        bg-white\n                        text-gray-700\n                        rounded\n                        py-1\n                        px-2\n                      \"\n                    >\n                      {{ action.label }}\n                    </div>\n                    <icon\n                      slot=\"reference\"\n                      :name=\"action.icon\"\n                      :class=\"action.class\"\n                      size=\"l\"\n                      color=\"text-gray-500\"\n                      class=\"mr-1 focus:outline-none p-1\"\n                      :stop-propagation=\"true\"\n                      @click=\"actOnRow(action, index)\"\n                    />\n                  </popper>\n                </template>\n              </div>\n              <div v-else class=\"flex flex-row items-center justify-center\">\n                <div\n                  class=\"\n                    rounded-full\n                    h-6\n                    w-6\n                    flex flex-row\n                    items-center\n                    justify-center\n                    hover:bg-gray-700\n                    text-white\n                    border-2 border-gray-700\n                  \"\n                  :class=\"isSelected(row) ? 'bg-gray-700 tx-white' : 'bg-white'\"\n                  @click=\"selectRow(row)\"\n                >\n                  <!-- <i class=\"fa fa-check text-xs\" :class=\"isSelected(row) ? 'text-white' : 'text-gray-700'\"></i> -->\n                </div>\n              </div>\n            </td>\n          </tr>\n          <tr v-if=\"editIndex == index\" :key=\"'0_' + index\">\n            <td :colspan=\"headers.length + 2\">\n              <div v-if=\"!readonly && fields\" class=\"bg-blue-light p-5 my-2\">\n                <awesome-form\n                  :form.sync=\"resourceToEdit\"\n                  :is_edit=\"true\"\n                  :headers=\"fields\"\n                  :validate=\"true\"\n                  @valid=\"(_valid) => (resourceToEditValid = _valid)\"\n                  @change=\"(_resource) => (resourceToEdit = _resource)\"\n                />\n                <div class=\"flex flex-row w-full mt-5\">\n                  <div class=\"ml-auto\">\n                    <button\n                      v-show=\"mode == 'edit'\"\n                      class=\"\n                        btn\n                        bg-transparent\n                        text-gray-600\n                        mr-3\n                        active:outline-none\n                        focus:outline-none\n                        hover:text-gray-800\n                      \"\n                      @click=\"cancelCreation()\"\n                    >\n                      Annulla\n                    </button>\n                    <button\n                      :disabled=\"!resourceToEditValid\"\n                      class=\"\n                        bg-blue\n                        text-white\n                        disabled:bg-gray-light\n                        disabled:text-gray\n                        disabled:cursor-not-allowed\n                        focus:outline-none\n                      \"\n                      @click=\"createNew()\"\n                    >\n                      {{ mode == \"edit\" ? \"Salva\" : \"Aggiungi\" }}\n                    </button>\n                  </div>\n                </div>\n              </div>\n              <div v-if=\"fields && !readonly\" class=\"flex flex-row\" />\n            </td>\n          </tr>\n        </template>\n        <tr v-if=\"editIndex == 'add'\">\n          <td :colspan=\"headers.length + 2\">\n            <div v-if=\"!readonly && fields\" class=\"bg-blue-light p-5 my-2\">\n              <awesome-form\n                :form.sync=\"resourceToEdit\"\n                :is_edit=\"false\"\n                :headers=\"fields\"\n                :validate=\"true\"\n                @valid=\"(_valid) => (resourceToEditValid = _valid)\"\n                @change=\"(_resource) => (resourceToEdit = _resource)\"\n              />\n              <div class=\"flex flex-row w-full mt-5\">\n                <div class=\"ml-auto\">\n                  <button\n                    class=\"\n                      btn\n                      bg-transparent\n                      text-gray-600\n                      mr-3\n                      active:outline-none\n                      focus:outline-none\n                      hover:text-gray-800\n                    \"\n                    @click=\"cancelCreation()\"\n                  >\n                    Annulla\n                  </button>\n                  <button\n                    :disabled=\"!resourceToEditValid\"\n                    class=\"\n                      bg-blue\n                      text-white\n                      disabled:bg-gray-light\n                      disabled:text-gray\n                      disabled:cursor-not-allowed\n                      focus:outline-none\n                    \"\n                    @click=\"createNew()\"\n                  >\n                    {{ mode == \"edit\" ? \"Salva\" : \"Aggiungi\" }}\n                  </button>\n                </div>\n              </div>\n            </div>\n          </td>\n        </tr>\n        <tr v-if=\"!rows || rows.length == 0\">\n          <td :colspan=\"headers.length + 2\">\n            <slot name=\"no-data\">\n              <div\n                class=\"\n                  text-center text-gray\n                  font-bold\n                  text-md\n                  font-semibold\n                  bg-white\n                  py-5\n                \"\n              >\n                Nessuna riga da mostrare\n              </div>\n            </slot>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n</template>\n<script>\nimport Popper from \"@/components/Popper.vue\";\nimport SvgIcon from \"@/components/SvgIcon.vue\";\nimport { isObject } from \"lodash\";\nimport ActionsMixin from \"@/mixins/actions.mixin.js\";\n\nexport default {\n  name: \"AwesomeTable\",\n  components: {\n    \"svg-icon\": SvgIcon,\n    popper: Popper,\n  },\n  mixins: [ActionsMixin],\n  props: {\n    rows: { required: true, default: [] },\n    headers: { required: true, default: [] },\n    actions: {\n      required: false,\n      default() {\n        return [];\n      },\n    },\n    fields: { required: false },\n    addResourceClass: { required: false, default: \"\" },\n    headerClass: { required: false, default: \"\" },\n    rowClass: { required: false, default: \"\" },\n    theme: { required: false, default: \"green\" },\n    striped: { required: false, default: true },\n    shadow: { required: false, default: true },\n    selectable: { required: false, default: false },\n    readonly: { required: false, default: false },\n    tableClass: {\n      required: false,\n      type: String,\n    },\n  },\n  data() {\n    return {\n      defaultAction: null,\n      selected_row: null,\n      mode: \"create\",\n      resourceToEdit: {},\n      resourceToEditValid: false,\n      editIndex: null,\n      ig_url: \"https://instagram.com/p\",\n      ig_usr_url: \"https://instagram.com\",\n    };\n  },\n  computed: {\n    visibleHeaders() {\n      return this.headers.filter((header) => {\n        if (!header.roles) {\n          return true;\n        }\n\n        return header.roles.includes(this.getUserRole());\n      });\n    },\n  },\n  mounted() {\n    this.defaultAction = this.actions.find((a) => a.default);\n  },\n  methods: {\n    isObject: isObject,\n    getImage(obj, header) {\n      if (header.type === \"image\") {\n        return this.deepPick(obj, header.field);\n      }\n      return `${this.ig_url}/${obj.ig_link.url}/media/?size=t`;\n    },\n    getRowClass(header) {\n      // Possible versions:\n      // class: \"justify-center\" => applied to both row and header\n      // class: {\n      //    row: 'justify-center',\n      //    header: 'justify-start'\n      // }\n\n      if (header.class && header.class.row) {\n        return header.class.row;\n      }\n\n      return header.class || \"justify-center\";\n    },\n    getHeaderClass(header) {\n      // Possible versions:\n      // class: \"justify-center\" => applied to both row and header\n      // class: {\n      //    row: 'justify-center',\n      //    header: 'justify-start'\n      // }\n\n      if (header.class && header.class.header) {\n        return header.class.header;\n      }\n\n      return header.class || \"justify-center\";\n    },\n    getSelectedRowClass(row) {\n      let row_class = \"\";\n\n      if (this.selectable) {\n        row_class += \" hover:bg-gray-200 cursor-pointer\";\n        if (row.id == (this.selected_row ? this.selected_row.id : -1)) {\n          row_class += \" bg-gray-200\";\n        }\n      }\n      return row_class;\n    },\n    isSelected(row) {\n      if (!this.selected_row) return false;\n      return this.selected_row.id == row.id;\n    },\n    handleRowClick(row, index) {\n      if (this.selectable) {\n        this.selectRow(row);\n        return;\n      }\n\n      // If default action, act accordingly\n      if (this.defaultAction) {\n        this.$emit(\"act\", {\n          action: this.defaultAction,\n          index,\n        });\n      } else {\n        this.$emit(\"click\", index);\n      }\n    },\n    actOnRow(action, index) {\n      if (!this.fields) {\n        this.$emit(\"act\", {\n          action,\n          index,\n        });\n        return;\n      }\n\n      // We are using the editor right inside the table\n      if (this[action.callback]) {\n        this[action.callback](index);\n      }\n    },\n    selectRow(row) {\n      this.selected_row = row;\n      this.$emit(\"selected\", { row: this.selected_row });\n    },\n    getActionVisibility(action, row) {\n      if (!action.visible) {\n        return true;\n      }\n\n      let negative = action.visible[0] === \"!\";\n      let field = action.visible;\n\n      if (negative) {\n        field = action.visible.substring(1, action.visible.length);\n      }\n\n      let value = this.deepPick(row, field);\n\n      return negative ? !value : !!value;\n    },\n    cancelCreation() {\n      this.resourceToEdit = {};\n      this.mode = \"create\";\n      this.editIndex = null;\n    },\n    canAdd() {\n      let canAdd = true;\n\n      this.fields.forEach((field) => {\n        if (field.validator) {\n          field.validator.forEach((validator) => {\n            switch (validator) {\n              case \"required\":\n                canAdd = canAdd && !!this.resourceToEdit[field.field];\n                break;\n            }\n          });\n        }\n      });\n\n      return canAdd;\n    },\n    addRow() {\n      this.mode = \"create\";\n      this.editIndex = \"add\";\n      this.resourceToEdit = {};\n    },\n    createNew() {\n      let new_row = _.clone(this.resourceToEdit);\n\n      this.resourceToEdit = {};\n\n      let rows = _.clone(this.rows);\n\n      if (this.mode != \"edit\") {\n        rows.push(new_row);\n      } else {\n        rows[this.editIndex] = new_row;\n      }\n\n      this.mode = \"create\";\n      this.editIndex = null;\n\n      this.$emit(\"row-added\", rows);\n    },\n    edit(index) {\n      this.mode = \"edit\";\n\n      let row = this.rows[index];\n\n      this.resourceToEdit = JSON.parse(JSON.stringify(row));\n\n      this.editIndex = index;\n    },\n    async delete(index) {\n      /*\n      let response = await this.$fire({\n        title: \"Elimina Riga\",\n        text: \"Sei sicuro di voler cancellare questo elemento?\",\n        type: \"question\",\n        animation: false,\n        focusCancel: true,\n        confirmButtonColor: \"red\",\n        confirmButtonText: \"Elimina\",\n        cancelButtonText: \"Annulla\",\n        showCancelButton: true,\n        reverseButtons: true\n      });\n      */\n      let result = confirm(\"Sei sicuro di voler cancellare questa riga?\");\n\n      if (result) {\n        this.rows.splice(index, 1);\n      }\n\n      this.$emit(\"row-deleted\", this.rows);\n    },\n    getPillBgColor(color) {\n      if (!color) {\n        return \"bg-gray-500\";\n      }\n      return color;\n    },\n  },\n};\n</script>\n\n<style>\n.select-circle {\n  height: 20px;\n  width: 20px;\n  border-radius: 50%;\n  border: 1px solid var(--primary);\n  transition: 0.2s ease-in-out;\n}\n\n.select-circle:hover {\n  background-color: var(--primary);\n}\n\n.select-circle.selected {\n  background-color: var(--primary);\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$d = undefined;
  /* module identifier */
  var __vue_module_identifier__$d = undefined;
  /* functional template */
  var __vue_is_functional_template__$d = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$d = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$d, staticRenderFns: __vue_staticRenderFns__$d },
    __vue_inject_styles__$d,
    __vue_script__$d,
    __vue_scope_id__$d,
    __vue_is_functional_template__$d,
    __vue_module_identifier__$d,
    false,
    createInjector,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//

var script$e = {
  data: function data() {
    return {
      colors: [
        "blue",
        "red",
        "gray",
        "orange",
        "indigo",
        "purple",
        "pink",
        "green",
        "teal"
      ],
      steps: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
    };
  }
};

/* script */
var __vue_script__$e = script$e;

/* template */
var __vue_render__$e = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      directives: [
        { name: "show", rawName: "v-show", value: false, expression: "false" }
      ]
    },
    _vm._l(_vm.colors, function(color) {
      return _c(
        "div",
        { key: color },
        _vm._l(_vm.steps, function(step) {
          return _c("span", {
            key: step,
            staticClass: "color-swatch",
            class: "bg-" + color + "-" + step
          })
        }),
        0
      )
    }),
    0
  )
};
var __vue_staticRenderFns__$e = [];
__vue_render__$e._withStripped = true;

  /* style */
  var __vue_inject_styles__$e = undefined;
  /* scoped */
  var __vue_scope_id__$e = undefined;
  /* module identifier */
  var __vue_module_identifier__$e = undefined;
  /* functional template */
  var __vue_is_functional_template__$e = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$e = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$e, staticRenderFns: __vue_staticRenderFns__$e },
    __vue_inject_styles__$e,
    __vue_script__$e,
    __vue_scope_id__$e,
    __vue_is_functional_template__$e,
    __vue_module_identifier__$e,
    false,
    undefined,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//

var script$f = {
  props: {
    user: { required: true, default: {} },
    field: { required: false, default: null }
  },
  computed: {
    avatarPic: function avatarPic() {
      if (this.field) {
        var profile_url = this.deepFind(this.user, this.field);
        return ("url(" + profile_url + ")");
      }

      return this.user.account && this.user.account.profile_pic_url
        ? "url(" + this.user.account.profile_pic_url + ")"
        : "";
    }
  }
};

/* script */
var __vue_script__$f = script$f;

/* template */
var __vue_render__$f = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass:
        "rounded-full bg-gray-400 flex flex-col items-center justify-center bg-no-repeat bg-center bg-cover",
      style: {
        backgroundImage: _vm.avatarPic
      }
    },
    [
      _vm.avatarPic == ""
        ? _c("i", { staticClass: "hi-user text-lg text-white" })
        : _vm._e()
    ]
  )
};
var __vue_staticRenderFns__$f = [];
__vue_render__$f._withStripped = true;

  /* style */
  var __vue_inject_styles__$f = undefined;
  /* scoped */
  var __vue_scope_id__$f = undefined;
  /* module identifier */
  var __vue_module_identifier__$f = undefined;
  /* functional template */
  var __vue_is_functional_template__$f = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$f = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$f, staticRenderFns: __vue_staticRenderFns__$f },
    __vue_inject_styles__$f,
    __vue_script__$f,
    __vue_scope_id__$f,
    __vue_is_functional_template__$f,
    __vue_module_identifier__$f,
    false,
    undefined,
    undefined,
    undefined
  );

//
//
//
//
//

var script$g = {
  props: {
    values: {},
    elem: {}
  },
  data: function data() {
    return {
      innerWidth: 0
    };
  },
  mounted: function mounted() {
    var first_value = this.deepPick(this.elem, this.values.first.field);
    var second_value = this.deepPick(this.elem, this.values.second.field);

    this.innerWidth = 100 - (second_value / (first_value + second_value)) * 100;
  }
};

/* script */
var __vue_script__$g = script$g;

/* template */
var __vue_render__$g = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "rounded-full overflow-hidden w-full bg-blue-400" },
    [
      _c("div", {
        staticClass: "bg-green-400 py-2",
        style: { width: _vm.innerWidth + "%" }
      })
    ]
  )
};
var __vue_staticRenderFns__$g = [];
__vue_render__$g._withStripped = true;

  /* style */
  var __vue_inject_styles__$g = undefined;
  /* scoped */
  var __vue_scope_id__$g = undefined;
  /* module identifier */
  var __vue_module_identifier__$g = undefined;
  /* functional template */
  var __vue_is_functional_template__$g = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$g = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$g, staticRenderFns: __vue_staticRenderFns__$g },
    __vue_inject_styles__$g,
    __vue_script__$g,
    __vue_scope_id__$g,
    __vue_is_functional_template__$g,
    __vue_module_identifier__$g,
    false,
    undefined,
    undefined,
    undefined
  );

/* script */

/* template */
var __vue_render__$h = function(_h, _vm) {
  var _c = _vm._c;
  return _c("v-lazy-image", {
    attrs: {
      src: _vm.props.src,
      "src-placeholder": _vm.props.srcPlaceholder,
      alt: "Periscope"
    }
  })
};
var __vue_staticRenderFns__$h = [];
__vue_render__$h._withStripped = true;

  /* style */
  var __vue_inject_styles__$h = function (inject) {
    if (!inject) { return }
    inject("data-v-716f8702_0", { source: "\n.v-lazy-image[data-v-716f8702] {\n@apply w-full h-48 object-cover;\n  filter: blur(5px);\n  transition: filter 1.6s;\n  will-change: filter;\n}\n.v-lazy-image-loaded[data-v-716f8702] {\n  filter: blur(0);\n}\n", map: {"version":3,"sources":["/app/estia/src/components/BlurImage.vue"],"names":[],"mappings":";AASA;AACA,+BAAA;EACA,iBAAA;EACA,uBAAA;EACA,mBAAA;AACA;AACA;EACA,eAAA;AACA","file":"BlurImage.vue","sourcesContent":["<template functional>\n  <v-lazy-image\n    :src=\"props.src\"\n    :src-placeholder=\"props.srcPlaceholder\"\n    alt=\"Periscope\"\n  ></v-lazy-image>\n</template>\n\n<style scoped>\n.v-lazy-image {\n  @apply w-full h-48 object-cover;\n  filter: blur(5px);\n  transition: filter 1.6s;\n  will-change: filter;\n}\n.v-lazy-image-loaded {\n  filter: blur(0);\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$h = "data-v-716f8702";
  /* module identifier */
  var __vue_module_identifier__$h = undefined;
  /* functional template */
  var __vue_is_functional_template__$h = true;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$h = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$h, staticRenderFns: __vue_staticRenderFns__$h },
    __vue_inject_styles__$h,
    {},
    __vue_scope_id__$h,
    __vue_is_functional_template__$h,
    __vue_module_identifier__$h,
    false,
    createInjector,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$h = {
  name: "PageError",
  props: {
    error: { required: true }
  },
  mounted: function mounted() {},
  data: function data() {
    return {};
  },
  methods: {},
  computed: {}
};

/* script */
var __vue_script__$h = script$h;

/* template */
var __vue_render__$i = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "flex-grow flex flex-col items-center justify-center" },
    [
      _vm.error == 404
        ? _c(
            "div",
            { staticClass: "flex flex-col items-center mb-20" },
            [
              _c("svg-icon", {
                attrs: { name: "no-data", width: "w-64", height: "h-64" }
              }),
              _vm._v(" "),
              _vm._m(0)
            ],
            1
          )
        : _vm._e(),
      _vm._v(" "),
      _vm.error == 500
        ? _c(
            "div",
            { staticClass: "flex flex-col items-center mb-20" },
            [
              _c("svg-icon", {
                attrs: { name: "error", width: "w-64", height: "h-64" }
              }),
              _vm._v(" "),
              _vm._m(1)
            ],
            1
          )
        : _vm._e()
    ]
  )
};
var __vue_staticRenderFns__$i = [
  function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "div",
      {
        staticClass: "text-indigo-600 font-semibold text-2xl mt-5 text-center"
      },
      [
        _vm._v(
          "\n      I dati relativi a questa pagina non sono disponibili.\n      "
        ),
        _c("br"),
        _vm._v(" "),
        _c("span", { staticClass: "text-gray-500 text-xl mt-3 block" }, [
          _vm._v(
            "\n        Di solito impieghiamo fino a 24 ore per recuperarli, stay tuned!\n      "
          )
        ])
      ]
    )
  },
  function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "div",
      {
        staticClass: "text-indigo-600 font-semibold text-2xl mt-5 text-center"
      },
      [
        _vm._v("\n      Oooooopsss... Qualcosa è andato storto!\n      "),
        _c("br"),
        _vm._v(" "),
        _c("span", { staticClass: "text-gray-500 text-xl mt-3 block" }, [
          _vm._v(
            "\n        Ma non tememere: abbiamo mandato una notifica ai nostri tecnici.\n        "
          ),
          _c("br"),
          _vm._v(
            "\n        Risolveremo nel più breve tempo possibile, stay tuned!\n      "
          )
        ])
      ]
    )
  }
];
__vue_render__$i._withStripped = true;

  /* style */
  var __vue_inject_styles__$i = undefined;
  /* scoped */
  var __vue_scope_id__$i = undefined;
  /* module identifier */
  var __vue_module_identifier__$i = undefined;
  /* functional template */
  var __vue_is_functional_template__$i = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$i = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$i, staticRenderFns: __vue_staticRenderFns__$i },
    __vue_inject_styles__$i,
    __vue_script__$h,
    __vue_scope_id__$i,
    __vue_is_functional_template__$i,
    __vue_module_identifier__$i,
    false,
    undefined,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//

var script$i = {
  name: "ErrorBoundary",
  props: {
    stopPropagation: Boolean,
  },
  data: function data() {
    return {
      errorStatus: null,
      err: false,
    };
  },
  beforeMount: function beforeMount() {
    var this$1 = this;

    this.EventBus.$on("err-boundary", function (err) {
      this$1.reloadError(err);
    });
  },
  beforeDestroy: function beforeDestroy() {},
  errorCaptured: function errorCaptured(err) {
    this.reloadError(err);
    return true;
  },
  methods: {
    resetError: function resetError() {
      this.err = null;
    },
    reloadError: function reloadError(err) {
      this.err = err;

      if (err.response) {
        this.errorStatus = err.response.status || 500;
      } else {
        this.errorStatus = 500;
      }
    },
  },
  watch: {
    $route: {
      handler: function handler() {
        this.err = null;
      },
    },
  },
};

/* script */
var __vue_script__$i = script$i;

/* template */
var __vue_render__$j = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    [
      _vm.err
        ? _vm._t(
            "error",
            function() {
              return [_c("page-error", { attrs: { error: _vm.errorStatus } })]
            },
            { err: _vm.err }
          )
        : _vm._t("default")
    ],
    2
  )
};
var __vue_staticRenderFns__$j = [];
__vue_render__$j._withStripped = true;

  /* style */
  var __vue_inject_styles__$j = undefined;
  /* scoped */
  var __vue_scope_id__$j = undefined;
  /* module identifier */
  var __vue_module_identifier__$j = undefined;
  /* functional template */
  var __vue_is_functional_template__$j = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$j = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$j, staticRenderFns: __vue_staticRenderFns__$j },
    __vue_inject_styles__$j,
    __vue_script__$i,
    __vue_scope_id__$j,
    __vue_is_functional_template__$j,
    __vue_module_identifier__$j,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$j = {
  name: 'AwesomeForm',
  props: {
    debug: { required: false, default: false },
    isEdit: { required: false, default: false },
    form: { required: true, default: function () {} },
    readonly: { required: false, default: false },
    validate: { required: false, default: false },
    headers: { required: true, default: function () {} },
    layout: {
      required: false,
      default: 'vertical',
      type: String
    },
    separatorClass: {
      required: false,
      type: String,
      default: function default$1 () {
        return this.$theme.separatorClass
      }
    },
    labelClass: {
      required: false,
      type: String,
      default: function default$2 () {
        return this.$theme.labelClass
      }
    },
    inputClass: {
      required: false,
      type: String,
      default: function default$3 () {
        return this.$theme.inputClass
      }
    },
    fieldClass: {
      required: false,
      type: String,
      default: function default$4 () {
        return this.$theme.fieldClass
      }
    }
  },
  data: function data () {
    return {
      updateHeaders: new Date().getTime(),
      loading: true,
      dataForm: {},
      changedFields: {},
      oldForm: {},
      userChoices: [],
      form_options: {},
      form_validation_status: {},
      form_is_valid: {},
      form_errors: {},
      form_dirty_status: {}
    }
  },
  mounted: async function mounted () {
    this.loading = true;

    this.log(this.$vnode.key, 'mounted', this.form);

    // Use a private clone so that we can
    // change it entirely to trigger some refresh
    try {
      var dataForm = JSON.parse(JSON.stringify(this.form));
      this.$set(this, 'dataForm', dataForm || {});
    } catch (e) {
      this.dataForm = {};
    }

    // load params for select field
    await this.fetchOptions();

    this.updateOldForm(this.dataForm);
    this.validatedataForm();

    // this.setDependableVariables();
    this.watchableOptions();

    this.loading = false;
  },
  beforeDestroy: function beforeDestroy () {
    // this.event_bus.$off('aw:form:update', this.forceUpdate);
  },
  methods: {
    setDirty: function setDirty (field) {
      _$1.set(this.form_dirty_status, field, true);
    },
    /**
     * This function check if option has @ symbol and if it true it checks if the function named
     * after @ is present then execute the function and return the list of options based on the
     * condition present in the function
     */
    watchableOptions: function watchableOptions () {
      var this$1 = this;

      // add the unwatch
      this.$watch(
        "dataForm",
        function (newV, oldV) {
          var optionstoCheck = this$1.visible_headers.filter(
            function (header) { return header.type == 'dynamicRadio'; }
          );

          this$1.log('optionsToCheck', optionstoCheck);
          optionstoCheck.forEach(function (header) {
            var result = null;

            Object.values(header.options)
              .filter(function (option) {
                // se c'è una condizione da validare viene validata
                if (!option.visible) {
                  return true
                }

                var isOptionVisible = true;
                option.visible.forEach(function (condition) {
                  isOptionVisible =
                    isOptionVisible &&
                    this$1.evaluateCondition(condition, this$1.dataForm);
                });
                return isOptionVisible
              })
              .forEach(function (option) {
                // se è una semplice option fa il return
                if (!result) {
                  result = {};
                }
                result[option.value] = option.name;
              });
            this$1.form_options[header.field] = result;
          });
        },
        { deep: true }
      );
    },
    handleBooleanClick: function handleBooleanClick (header) {
      var currentValue = this.deepPick(this.dataForm, header.field);
      this.updateNested(header.field, !currentValue);
    },
    updateFormulate: function updateFormulate (formulateForm) {
      var this$1 = this;

      // Merge data from Formulate and from our own nested two way bindings
      this.log('formulateForm: ', formulateForm);
      Object.keys(formulateForm).forEach(function (fieldName) {
        this$1.$set(
          this$1.dataForm,
          fieldName,
          this$1.deepPick(formulateForm, fieldName)
        );
      });

      this.updateOldForm(this.dataForm);
      this.validatedataForm();
      this.updateHeaders = new Date().getTime();

      this.log(this.$vnode.key, 'update', this.dataForm);
      // this.$forceUpdate();
    },
    updateNested: function updateNested (field, value) {
      _$1.set(this.dataForm, field, value);
      this.setDirty(field);

      this.updateOldForm(this.dataForm);
      this.validatedataForm();

      this.updateHeaders = new Date().getTime();
      // this.$forceUpdate();
    },
    /**
     * deprecated
    listenForAwEvents() {
      this.event_bus.$on("aw:form:update", this.forceUpdate());
    }, */
    parseDate: function parseDate (header) {
      var parsedDate = this.moment(
        this.dataForm[header.field],
        'YYYY-MM-DD'
      ).toDate();

      return parsedDate
    },
    formatDate: function formatDate (newDate) {
      return this.moment(newDate).format('YYYY-MM-DD')
    },
    forceUpdate: function forceUpdate () {
      this.updateHeaders = new Date().getTime();
    },
    fetchOptions: async function fetchOptions () {
      var this$1 = this;

      var promises = [];
      var selectCodes = [];

      for (var vhIndex = 0; vhIndex < this.headers.length; vhIndex++) {
        var header = this.headers[vhIndex];

        if (header.type === 'select' || header.isFetchable || header.select) {
          if (header.select && header.select.choices) {
            this.form_options[header.select.code] = header.select.choices;
          } else {
            selectCodes.push(header.select.code);

            var url = header.select.url;
            if (header.select.of) {
              url = url.concat(("/" + (this.deepFind(this, header.select.of))));
            }

            if (header.select.type && header.select.type == 'param') {
              promises.push(this.$api.params(url));
            } else {
              promises.push(this.$api.list(url));
            }
          }
        }

        if (header.type == 'boolean') {
          this.updateNested(
            this.dataForm,
            header.field,
            header.default ? header.default : false
          );
        }
      }

      var selectValues = await Promise.all(promises);

      selectValues.forEach(function (values, index) {
        this$1.form_options[selectCodes[index]] = values;
      });

      this.$forceUpdate();
    },
    validatedataForm: function validatedataForm () {
      var this$1 = this;

      if (!this.validate) { return 0 }
      if (!this.headers) { return 0 }
      if (!this.dataForm) { return 0 }

      this.form_is_valid = true;

      this.headers.forEach(function (header) {
        if (header.type == 'form') {
          return
        }

        if (!this$1.fieldIsVisible(header)) {
          return
        }

        var validation_rules = header.validator || [];

        var validationStatus = {
          valid: true,
          errors: [],
          status: 'validated'
        };

        validation_rules.forEach(function (rule) {
          var ruleTokens = rule.split(':');

          var ruleCode = ruleTokens[0];
          var ruleParams = ruleTokens[1] ? ruleTokens[1].split(',') : [];

          var fieldValue = this$1.deepPick(this$1.dataForm, header.field);

          var conditions = [];

          var currentValue;
          var otherValue;

          switch (ruleCode) {
            case 'required':
              var fieldValueIsEmpty = false;

              switch (typeof fieldValue) {
                case 'object':
                  fieldValueIsEmpty = _$1.isEmpty(fieldValue);
                  break
                default:
                  fieldValueIsEmpty = ['', undefined, null, NaN].includes(
                    fieldValue
                  );
                  break
              }

              if (fieldValueIsEmpty) {
                this$1.form_is_valid = false;

                validationStatus.valid = false;
                validationStatus.errors.push('Campo obbligatorio');
              }
              break

            case 'required_if':
              currentValue = fieldValue;
              otherValue = this$1.deepPick(this$1.dataForm, ruleParams[0]);

              if (otherValue) {
                switch (typeof fieldValue) {
                  case 'object':
                    fieldValueIsEmpty = _$1.isEmpty(fieldValue);
                    break
                  default:
                    fieldValueIsEmpty = ['', undefined, null, NaN].includes(
                      fieldValue
                    );
                    break
                }

                if (fieldValueIsEmpty) {
                  this$1.form_is_valid = false;

                  validationStatus.valid = false;
                  validationStatus.errors.push('Campo obbligatorio');
                }
              }
              break

            case 'equal':
              currentValue = fieldValue;
              otherValue = this$1.dataForm[ruleParams[0]];

              if (
                (!!currentValue || !!otherValue) &&
                currentValue != otherValue
              ) {
                this$1.form_is_valid = false;
                validationStatus.valid = false;
                validationStatus.errors.push('I due valori non corrispondono');
              }
              break

            case 'file_with_owner':
              var fileObject = fieldValue;

              if (
                !_$1.isEmpty(fileObject) &&
                (_$1.isEmpty(fileObject.status) || _$1.isEmpty(fileObject.doc))
              ) {
                this$1.form_is_valid = false;
                validationStatus.valid = false;
                validationStatus.errors.push(
                  'Inserire documento e relativo stato'
                );
              }
              break

            case 'after_or_equal':
              conditions = [header.field, 'AFTER_OR_EQUAL', ruleParams[0]];

              if (
                !this$1.evaluateCondition(
                  conditions,
                  this$1.dataForm,
                  this$1.dataForm
                )
              ) {
                var referencedHeader = this$1.visible_headers.find(function (header) {
                  return ("$" + (header.field)) == ruleParams[0]
                });

                var referencedHeaderName = referencedHeader
                  ? referencedHeader.label
                  : ruleParams[0];

                this$1.form_is_valid = false;
                validationStatus.validationStatus = false;
                validationStatus.errors.push(
                  'La data deve essere maggiore o uguale a: ' +
                    referencedHeaderName
                );
              }
              break

            case 'after':
              conditions = [header.field, 'AFTER', ruleParams[0]];

              if (
                !this$1.evaluateCondition(
                  conditions,
                  this$1.dataForm,
                  this$1.dataForm
                )
              ) {
                var referencedHeader$1 = this$1.visible_headers.find(function (header) {
                  // ruleParams[0] is in the form "$<name_of_target_input>"
                  return ("$" + (header.field)) == ruleParams[0]
                });

                var referencedHeaderName$1 = referencedHeader$1
                  ? referencedHeader$1.label
                  : ruleParams[0];

                this$1.form_is_valid = false;
                validationStatus.validationStatus = false;
                validationStatus.errors.push(
                  'La data deve essere maggiore di: ' + referencedHeaderName$1
                );
              }
              break

            case 'email':
              if (!this$1.$validators['email'](fieldValue)) {
                this$1.form_is_valid = false;
                validationStatus.valid = false;
                validationStatus.errors.push('Il campo email non è valido');
              }
              break
            case 'fiscal_code':
              if (!this$1.$validators['fiscal_code'](fieldValue)) {
                this$1.form_is_valid = false;
                validationStatus.valid = false;
                validationStatus.errors.push('Il Codice Fiscale non è valido');
              }
              break
            case 'vat_number':
              if (!this$1.$validators['vat_number'](fieldValue)) {
                this$1.form_is_valid = false;
                validationStatus.valid = false;
                validationStatus.errors.push('La Partita IVA non è valida');
              }
              break
          }
        });

        // if durty set the error unless not set the error
        if (this$1.deepPick(this$1.form_dirty_status, header.field)) {
          console.log('aggiungo il dirty');
          _$1.set(this$1.form_validation_status, header.field, validationStatus);
        }
      });

      this.$emit('valid', this.form_is_valid);
    },
    fieldIsVisible: function fieldIsVisible (header) {
      var this$1 = this;

      var isRoleVisible = true;
      var isFilterVisible = true;
      var isScopeVisible = true;

      if (header.roles) {
        isRoleVisible = header.roles.includes(this.getUserRole());
      }

      if (header.visible) {
        this.log('visible', header.visible);
        header.visible.forEach(function (condition) {
          isFilterVisible =
            isFilterVisible && this$1.evaluateCondition(condition, this$1.dataForm);
        });
      }

      if (header.scopes) {
        isScopeVisible = header.scopes.includes(this.scope);
      }

      return isRoleVisible && isFilterVisible && isScopeVisible
    },
    fieldIsReadonly: function fieldIsReadonly (header) {
      if (this.readonly) {
        return true
      }

      if (header.readonly == undefined) {
        return false
      }

      if (typeof header.readonly === 'boolean') {
        return header.readonly
      }

      var mode = this.isEdit ? 'edit' : 'create';

      // If it's false or not set I return false
      // otherwise I simply return the value
      return header.readonly[mode] != undefined ? header.readonly[mode] : false
    },
    /**
     * deprecated
    toObject(arr, header) {
      if (!arr) {
        return;
      }

      var rv = {};

      for (var i = 0; i < arr.length; ++i) {
        rv[arr[i].id] = this.deepPick(arr[i], header.select.option);
      }

      return rv;
    }, */
    filterOptions: function filterOptions (header) {
      var this$1 = this;

      if (!header.select) {
        return []
      }

      if (header.options) {
        return header.options
      }

      if (header.select && header.select.filter == undefined) {
        return this.form_options[header.select.code]
      }

      if (!this.form_options[header.select.code]) {
        return []
      }

      var filteredOptions = [];

      filteredOptions = this.form_options[header.select.code].filter(function (option) {
        var isInFilter = this$1.evaluateCondition(
          header.select.filter,
          option,
          this$1.dataForm
        );

        return isInFilter
      });

      if (this.debug) {
        this.log(this.form_options);
        this.log(header.select.code);
        this.log(filteredOptions);
      }

      if (this.changedFields[header.select.filter[0]]) {
        this.dataForm[header.field] = undefined;
        this.changedFields[header.select.filter[0]] = false;
        this.$forceUpdate();
      }

      return filteredOptions
    },
    updateOldForm: function updateOldForm (newForm) {
      this.oldForm = JSON.parse(JSON.stringify(newForm));

      // Update form for parent component
      this.$emit('change', this.dataForm);
    },
    getLabelClass: function getLabelClass (header) {
      var cssClass = '';

      switch (header.type) {
        case 'form':
          cssClass = 'text-gray-700 text-normal';
          break

        case 'fieldset':
          cssClass = this.separatorClass;
          break

        default:
          cssClass = this.labelClass;
          break
      }

      if (header.select) {
        if (header.select.can_add) {
          cssClass += '';
        }
      }

      return cssClass
    },
    formFieldClass: function formFieldClass (header) {
      var formFieldClass = this.fieldClass;
      var minColSpan;

      var layout = header.layout || this.layout;

      if (layout == 'vertical') {
        formFieldClass += ' grid grid-cols-3 flex flex-row items-center';
        minColSpan = 12;
      } else {
        formFieldClass += ' flex flex-col';
        minColSpan = parseInt(12 / this.visible_headers.length);
      }

      if (header.type == 'form') {
        formFieldClass +=
          ' border border-rounded-sm border-dotted border-gray-light';
      } else {
        formFieldClass +=
          ' mb-3 col-span-' + (header.colSpan || header.col_span || minColSpan);
        formFieldClass += ' row-span-' + (header.rowSpan || 1);
      }

      return formFieldClass
    },
    setDependableVariables: function setDependableVariables () {
      var this$1 = this;

      var depandableHeaders = this.headers.filter(function (header) { return header.depends_on; });

      var loop = function ( i ) {
        var header = depandableHeaders[i];
        // fare il watch delle variabili presenti in var
        // eseguire la funzione computed passando le variabili presenti in var
        var varToWatch = header.depends_on.var[0];

        // add the unwatch
        this$1.$watch(
          ("dataForm." + varToWatch),
          function (newV, oldV) {
            this$1.$set(
              this$1.dataForm,
              header.field,
              header.depends_on.computed(newV)
            );
            this$1.updateHeaders = new Date().getTime();
          },
          { deep: true }
        );
      };

      for (var i = 0; i < depandableHeaders.length; i++) loop( i );
    }
  },
  computed: Object.assign({}, mapState('user', {
      user: function (state) { return state.user; }
    }),
    {scope: function scope () {
      return this.isEdit ? 'edit' : 'create'
    },
    visible_headers: function visible_headers () {
      var this$1 = this;

      var uh = this.updateHeaders;

      return this.headers.filter(function (header) {
        return this$1.fieldIsVisible(header)
      })
    }})
};

/* script */
var __vue_script__$j = script$j;

/* template */
var __vue_render__$k = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    [
      _vm.loading ? _c("loading") : _vm._e(),
      _vm._v(" "),
      !_vm.loading
        ? _c(
            "FormulateForm",
            {
              staticClass: "w-full grid grid-cols-12 gap-x-6",
              attrs: { name: "aw-form", values: _vm.dataForm },
              on: { input: _vm.updateFormulate }
            },
            [
              _vm.debug
                ? _c("pre", [
                    _vm._v(
                      "      form: " +
                        _vm._s(_vm.dataForm) +
                        "\n      valid: " +
                        _vm._s(_vm.form_is_valid) +
                        "\n      visible_headers: " +
                        _vm._s(_vm.visible_headers.length) +
                        "\n    "
                    )
                  ])
                : _vm._e(),
              _vm._v(" "),
              _vm._l(_vm.visible_headers, function(header, index) {
                return _c(
                  "div",
                  {
                    key: index,
                    staticClass: "relative focus-within:text-blue",
                    class: _vm.formFieldClass(header)
                  },
                  [
                    _c(
                      "label",
                      {
                        class: _vm.getLabelClass(header),
                        attrs: { for: header.field }
                      },
                      [
                        _vm._v(
                          "\n        " + _vm._s(header.label) + "\n        "
                        ),
                        (header.validator
                        ? header.validator.indexOf("required") != -1
                        : false)
                          ? _c(
                              "span",
                              { staticClass: "ml-1 font-bold text-orange-600" },
                              [_vm._v("*")]
                            )
                          : _vm._e()
                      ]
                    ),
                    _vm._v(" "),
                    _vm.$editFields[header.type]
                      ? _c(
                          "div",
                          { staticClass: "w-full" },
                          [
                            _c(_vm.$editFields[header.type], {
                              tag: "component",
                              attrs: {
                                disabled: _vm.fieldIsReadonly(header),
                                resources: _vm.filterOptions(header),
                                header: header,
                                "form-data": _vm.dataForm,
                                value: _vm.deepPick(_vm.dataForm, header.field)
                              },
                              on: {
                                change: function($event) {
                                  return _vm.updateNested(header.field, $event)
                                }
                              }
                            })
                          ],
                          1
                        )
                      : header.field && header.field.includes(".")
                      ? [
                          header.type == "select"
                            ? _c("resource-select", {
                                attrs: {
                                  disabled: _vm.fieldIsReadonly(header),
                                  resources: _vm.filterOptions(header),
                                  header: header,
                                  placeholder: header.placeholder,
                                  value: _vm.deepPick(
                                    _vm.dataForm,
                                    header.field
                                  )
                                },
                                on: {
                                  change: function($event) {
                                    return _vm.updateNested(
                                      header.field,
                                      $event
                                    )
                                  }
                                }
                              })
                            : _vm._e(),
                          _vm._v(" "),
                          header.type == "text"
                            ? _c("input", {
                                attrs: { type: "text" },
                                domProps: {
                                  value: _vm.deepPick(
                                    _vm.dataForm,
                                    header.field
                                  )
                                },
                                on: {
                                  input: function($event) {
                                    return _vm.updateNested(
                                      header.field,
                                      $event.target.value
                                    )
                                  }
                                }
                              })
                            : _vm._e(),
                          _vm._v(" "),
                          header.type == "number"
                            ? _c("input", {
                                attrs: { type: "number" },
                                domProps: {
                                  value: _vm.deepPick(
                                    _vm.dataForm,
                                    header.field
                                  )
                                },
                                on: {
                                  input: function($event) {
                                    return _vm.updateNested(
                                      header.field,
                                      $event.target.value
                                    )
                                  }
                                }
                              })
                            : _vm._e(),
                          _vm._v(" "),
                          header.type == "boolean"
                            ? [
                                _c(
                                  "label",
                                  {
                                    staticClass: "flex custom-label",
                                    on: {
                                      click: function($event) {
                                        return _vm.handleBooleanClick(header)
                                      }
                                    }
                                  },
                                  [
                                    _c(
                                      "div",
                                      {
                                        staticClass:
                                          "\n                flex\n                items-center\n                justify-center\n                w-6\n                h-6\n                p-1\n                mr-2\n                bg-white\n                shadow\n              "
                                      },
                                      [
                                        _c(
                                          "svg",
                                          {
                                            staticClass:
                                              "w-4 h-4 text-green-600 pointer-events-none",
                                            class: !!_vm.deepPick(
                                              _vm.dataForm,
                                              header.field
                                            )
                                              ? ""
                                              : "hidden",
                                            attrs: { viewBox: "0 0 172 172" }
                                          },
                                          [
                                            _c(
                                              "g",
                                              {
                                                staticStyle: {
                                                  "mix-blend-mode": "normal"
                                                },
                                                attrs: {
                                                  fill: "none",
                                                  "stroke-width": "none",
                                                  "stroke-miterlimit": "10",
                                                  "font-family": "none",
                                                  "font-weight": "none",
                                                  "font-size": "none",
                                                  "text-anchor": "none"
                                                }
                                              },
                                              [
                                                _c("path", {
                                                  attrs: {
                                                    d: "M0 172V0h172v172z"
                                                  }
                                                }),
                                                _vm._v(" "),
                                                _c("path", {
                                                  attrs: {
                                                    d:
                                                      "M145.433 37.933L64.5 118.8658 33.7337 88.0996l-10.134 10.1341L64.5 139.1341l91.067-91.067z",
                                                    fill: "currentColor",
                                                    "stroke-width": "1"
                                                  }
                                                })
                                              ]
                                            )
                                          ]
                                        )
                                      ]
                                    )
                                  ]
                                )
                              ]
                            : _vm._e(),
                          _vm._v(" "),
                          header.type == "textarea"
                            ? _c("textarea", {
                                domProps: {
                                  value: _vm.deepPick(
                                    _vm.dataForm,
                                    header.field
                                  )
                                },
                                on: {
                                  input: function($event) {
                                    return _vm.updateNested(
                                      header.field,
                                      $event.target.value
                                    )
                                  }
                                }
                              })
                            : _vm._e(),
                          _vm._v(" "),
                          header.type == "date"
                            ? _c("v-date-picker", {
                                attrs: {
                                  locale: "it",
                                  "min-date": header.minDate,
                                  value: _vm.deepPick(
                                    _vm.dataForm,
                                    header.field
                                  )
                                },
                                on: {
                                  input: function($event) {
                                    return _vm.updateNested(
                                      header.field,
                                      _vm.formatDate($event)
                                    )
                                  }
                                },
                                scopedSlots: _vm._u(
                                  [
                                    {
                                      key: "default",
                                      fn: function(ref) {
                                        var inputValue = ref.inputValue;
                                        var inputEvents = ref.inputEvents;
                                        return [
                                          _c(
                                            "input",
                                            _vm._g(
                                              {
                                                domProps: { value: inputValue }
                                              },
                                              inputEvents
                                            )
                                          )
                                        ]
                                      }
                                    }
                                  ],
                                  null,
                                  true
                                )
                              })
                            : _vm._e()
                        ]
                      : _c(
                          "div",
                          [
                            header.type == "form"
                              ? [
                                  _c("awesome-form", {
                                    staticClass: "px-10 w-12/12",
                                    attrs: {
                                      form: _vm.dataForm[header.field],
                                      headers: header.headers,
                                      validate: header.validate
                                    },
                                    on: {
                                      change: function(value) {
                                        return _vm.updateNested(
                                          header.field,
                                          value
                                        )
                                      }
                                    }
                                  })
                                ]
                              : header.type == "dynamicRadio"
                              ? [
                                  !_vm.form_options[header.field]
                                    ? _c("p", [
                                        _vm._v(
                                          "\n            " +
                                            _vm._s(header.info) +
                                            "\n          "
                                        )
                                      ])
                                    : _vm._e(),
                                  _vm._v(" "),
                                  _vm.form_options[header.field]
                                    ? _c("FormulateInput", {
                                        key: header.field,
                                        attrs: {
                                          id: header.field,
                                          readonly: _vm.fieldIsReadonly(header),
                                          type: "radio",
                                          placeholder: header.placeholder,
                                          name: header.field,
                                          header: header,
                                          options:
                                            _vm.form_options[header.field]
                                        }
                                      })
                                    : _vm._e()
                                ]
                              : header.type == "select"
                              ? [
                                  _c("FormulateInput", {
                                    staticClass: "flex-grow",
                                    attrs: {
                                      type: "resource-select",
                                      disabled: _vm.fieldIsReadonly(header),
                                      name: header.field,
                                      resources: _vm.filterOptions(header),
                                      "option-field": header.select.option,
                                      placeholder: header.placeholder,
                                      select: header.select
                                    }
                                  })
                                ]
                              : header.type == "dynamic-select" ||
                                header.type == "user"
                              ? [
                                  _c("FormulateInput", {
                                    key: header.field,
                                    attrs: {
                                      type: "dynamic-select",
                                      name: header.field,
                                      header: header,
                                      readonly: _vm.fieldIsReadonly(header)
                                    }
                                  })
                                ]
                              : header.type == "balance"
                              ? [
                                  _c(
                                    "div",
                                    { staticClass: "flex" },
                                    [
                                      _c("FormulateInput", {
                                        key: header.field,
                                        staticClass: "flex-grow rounded-r-none",
                                        attrs: {
                                          id: header.field,
                                          type: "number",
                                          readonly: _vm.fieldIsReadonly(header),
                                          placeholder: header.placeholder,
                                          name: header.field
                                        }
                                      }),
                                      _vm._v(" "),
                                      _c(
                                        "div",
                                        {
                                          staticClass:
                                            "\n                flex\n                items-center\n                bg-gray-200\n                border border-l-0 border-gray-300\n                rounded rounded-l-none\n                border-l-none\n              "
                                        },
                                        [
                                          _c(
                                            "span",
                                            {
                                              staticClass: "px-3 text-gray-600"
                                            },
                                            [_vm._v(_vm._s(header.udm))]
                                          )
                                        ]
                                      )
                                    ],
                                    1
                                  )
                                ]
                              : header.type == "boolean"
                              ? [
                                  _c(
                                    "label",
                                    { staticClass: "flex custom-label" },
                                    [
                                      _c(
                                        "div",
                                        {
                                          staticClass:
                                            "\n                flex\n                items-center\n                justify-center\n                w-6\n                h-6\n                p-1\n                mr-2\n                bg-white\n                shadow\n              "
                                        },
                                        [
                                          _c("FormulateInput", {
                                            staticClass: "hidden",
                                            attrs: {
                                              id: header.field,
                                              readonly: _vm.fieldIsReadonly(
                                                header
                                              ),
                                              type: "checkbox",
                                              name: header.field
                                            }
                                          }),
                                          _vm._v(" "),
                                          _c(
                                            "svg",
                                            {
                                              staticClass:
                                                "w-4 h-4 text-green-600 pointer-events-none",
                                              class: !!_vm.deepFind(
                                                _vm.dataForm,
                                                header.field
                                              )
                                                ? ""
                                                : "hidden",
                                              attrs: { viewBox: "0 0 172 172" }
                                            },
                                            [
                                              _c(
                                                "g",
                                                {
                                                  staticStyle: {
                                                    "mix-blend-mode": "normal"
                                                  },
                                                  attrs: {
                                                    fill: "none",
                                                    "stroke-width": "none",
                                                    "stroke-miterlimit": "10",
                                                    "font-family": "none",
                                                    "font-weight": "none",
                                                    "font-size": "none",
                                                    "text-anchor": "none"
                                                  }
                                                },
                                                [
                                                  _c("path", {
                                                    attrs: {
                                                      d: "M0 172V0h172v172z"
                                                    }
                                                  }),
                                                  _vm._v(" "),
                                                  _c("path", {
                                                    attrs: {
                                                      d:
                                                        "M145.433 37.933L64.5 118.8658 33.7337 88.0996l-10.134 10.1341L64.5 139.1341l91.067-91.067z",
                                                      fill: "currentColor",
                                                      "stroke-width": "1"
                                                    }
                                                  })
                                                ]
                                              )
                                            ]
                                          )
                                        ],
                                        1
                                      )
                                    ]
                                  )
                                ]
                              : header.type == "image_upload"
                              ? [
                                  _c("FormulateInput", {
                                    key: header.field,
                                    attrs: {
                                      id: header.field,
                                      type: "image-uploader",
                                      readonly: _vm.fieldIsReadonly(header),
                                      placeholder: header.placeholder,
                                      name: header.field
                                    }
                                  })
                                ]
                              : _c("FormulateInput", {
                                  key: header.field,
                                  attrs: {
                                    readonly: _vm.fieldIsReadonly(header),
                                    type: header.type,
                                    placeholder: header.placeholder,
                                    name: header.field,
                                    header: header,
                                    resource: header.resource,
                                    options: header.options
                                  },
                                  on: {
                                    "blur-context": function($event) {
                                      return _vm.setDirty(header.field)
                                    }
                                  }
                                })
                          ],
                          2
                        ),
                    _vm._v(" "),
                    _c(
                      "div",
                      { staticClass: "ml-2 mt-2 mr-auto error-container" },
                      [
                        _vm._t(
                          "errors",
                          function() {
                            return [
                              _vm.deepPick(
                                _vm.form_validation_status,
                                header.field
                              )
                                ? _c(
                                    "div",
                                    {
                                      staticClass: "flex flex-col items-center"
                                    },
                                    _vm._l(
                                      _vm.deepPick(
                                        _vm.form_validation_status,
                                        header.field
                                      ).errors,
                                      function(error, index) {
                                        return _c(
                                          "span",
                                          {
                                            key: index,
                                            staticClass: "mb-2 text-red-600"
                                          },
                                          [_vm._v(_vm._s(error))]
                                        )
                                      }
                                    ),
                                    0
                                  )
                                : _vm._e()
                            ]
                          },
                          {
                            status: _vm.deepPick(
                              _vm.form_validation_status,
                              header.field
                            ),
                            field: header
                          }
                        )
                      ],
                      2
                    )
                  ],
                  2
                )
              }),
              _vm._v(" "),
              _c("div", { staticClass: "hidden" }, [
                _vm._v(
                  "\n      This is to prevent Tailwind Purge from removing col-span and row-span\n      from CSS, since they are added to the code dynamically\n      "
                ),
                _c("div", { staticClass: "col-span-1 row-span-1" }),
                _vm._v(" "),
                _c("div", { staticClass: "col-span-2 row-span-2" }),
                _vm._v(" "),
                _c("div", { staticClass: "col-span-3 row-span-3" }),
                _vm._v(" "),
                _c("div", { staticClass: "col-span-4 row-span-4" }),
                _vm._v(" "),
                _c("div", { staticClass: "col-span-5 row-span-5" }),
                _vm._v(" "),
                _c("div", { staticClass: "col-span-6 row-span-6" }),
                _vm._v(" "),
                _c("div", { staticClass: "col-span-7 row-span-7" }),
                _vm._v(" "),
                _c("div", { staticClass: "col-span-8 row-span-8" }),
                _vm._v(" "),
                _c("div", { staticClass: "col-span-9 row-span-9" }),
                _vm._v(" "),
                _c("div", { staticClass: "col-span-10 row-span-10" }),
                _vm._v(" "),
                _c("div", { staticClass: "col-span-11 row-span-11" }),
                _vm._v(" "),
                _c("div", { staticClass: "col-span-12 row-span-12" })
              ])
            ],
            2
          )
        : _vm._e()
    ],
    1
  )
};
var __vue_staticRenderFns__$k = [];
__vue_render__$k._withStripped = true;

  /* style */
  var __vue_inject_styles__$k = function (inject) {
    if (!inject) { return }
    inject("data-v-57011414_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"AwesomeForm.vue"}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$k = undefined;
  /* module identifier */
  var __vue_module_identifier__$k = undefined;
  /* functional template */
  var __vue_is_functional_template__$k = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$k = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$k, staticRenderFns: __vue_staticRenderFns__$k },
    __vue_inject_styles__$k,
    __vue_script__$j,
    __vue_scope_id__$k,
    __vue_is_functional_template__$k,
    __vue_module_identifier__$k,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script$k = {
  name: "resource-select",
  props: {
    context: {
      type: Object,
      required: false,
    },
    value: {
      required: false,
    },
    resources: {
      required: false,
    },
    header: {
      required: false,
    },
  },
  data: function data() {
    return {
      optionsArray: null,
    };
  },
  beforeMount: function beforeMount() {},
  methods: {
    onChange: function onChange($event) {
      var newValue = this.options.find(function (o) { return o.id == $event.target.value; });

      this.log(this.code);

      if (this.context) {
        this.context.model = newValue;
      } else {
        this.$emit("change", newValue);
      }
    },
    onSearch: function onSearch(search, loading, param) {
      this.onSearchDebounced(search, loading, param, this);
    },
    reloadOptions: async function reloadOptions() {
      var url = this.select.url;
      if (this.select.of) {
        url = url.concat(("/" + (this.deepFind(this, header.select.of))));
      }

      var selectValues = [];

      if (this.select.type && this.select.type == "param") {
        selectValues = await this.$api.params(url);
      } else {
        selectValues = await this.$api.list(url);
      }

      this.optionsArray = selectValues;

      this.$forceUpdate();
    },
    addResource: function addResource() {
      var this$1 = this;

      if (!this.select) {
        this.$alert.show({});

        return;
      }

      this.$dialog.show({
        type: "resource-edit",
        resource: this.select.code,
        onConfirm: async function () {
          await this$1.reloadOptions();
        },
      });
    },
  },
  computed: {
    options: function options() {
      if (this.optionsArray == null) {
        return this.attributes.resources;
      }

      return this.optionsArray;
    },
    select: function select() {
      return this.attributes.select;
    },
    code: function code() {
      return this.select.option;
    },
    model: function model() {
      if (this.context) {
        return this.context.model;
      }

      return this.value || {};
    },
    attributes: function attributes() {
      if (this.context) {
        return this.context.attributes;
      }

      return {
        header: this.header,
        select: this.header.select,
        resources: this.resources,
        optionField: this.header.select.option,
        placeholder: this.header.placeholder,
      };
    },
    formattedOptions: function formattedOptions() {
      var this$1 = this;

      return this.options.map(function (opt) {
        return {
          id: opt.id,
          text: this$1.deepPick(opt),
        };
      });
    },
  },
};

/* script */
var __vue_script__$k = script$k;

/* template */
var __vue_render__$l = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { attrs: { "data-type": _vm.context ? _vm.context.type : "" } },
    [
      _vm.select.can_add
        ? _c(
            "div",
            {
              staticClass:
                "\n      absolute\n      top-0\n      right-0\n      flex flex-row\n      items-baseline\n      max-w-screen-xl\n    "
            },
            [
              _c(
                "div",
                {
                  staticClass:
                    "\n        flex flex-row\n        items-center\n        ml-auto\n        font-bold\n        cursor-pointer\n        text-blue\n        hover:text-blue-dark\n      ",
                  on: {
                    click: function($event) {
                      return _vm.addResource()
                    }
                  }
                },
                [
                  _c("i", { staticClass: "mr-2 ti-plus" }),
                  _vm._v(" "),
                  _c("span", [_vm._v("Aggiungi")])
                ]
              )
            ]
          )
        : _vm._e(),
      _vm._v(" "),
      _vm.options
        ? _c(
            "select",
            {
              staticClass: "flex-grow w-full form-control",
              attrs: { name: _vm.context ? _vm.context.name : "" },
              on: { change: _vm.onChange }
            },
            [
              _c("option", { attrs: { value: "undefined" } }, [
                _vm._v(_vm._s(_vm.attributes.placeholder))
              ]),
              _vm._v(" "),
              _vm._l(_vm.options, function(option) {
                return _c(
                  "option",
                  {
                    key: option.id,
                    domProps: {
                      selected:
                        option.id == _vm.model.id || option.id == _vm.model,
                      value: option.id
                    }
                  },
                  [
                    _vm._v(
                      "\n      " +
                        _vm._s(
                          _vm.attributes.select.option
                            ? _vm.deepPick(option, _vm.attributes.select.option)
                            : option.description
                        ) +
                        "\n    "
                    )
                  ]
                )
              })
            ],
            2
          )
        : _vm._e()
    ]
  )
};
var __vue_staticRenderFns__$l = [];
__vue_render__$l._withStripped = true;

  /* style */
  var __vue_inject_styles__$l = undefined;
  /* scoped */
  var __vue_scope_id__$l = undefined;
  /* module identifier */
  var __vue_module_identifier__$l = undefined;
  /* functional template */
  var __vue_is_functional_template__$l = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$l = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$l, staticRenderFns: __vue_staticRenderFns__$l },
    __vue_inject_styles__$l,
    __vue_script__$k,
    __vue_scope_id__$l,
    __vue_is_functional_template__$l,
    __vue_module_identifier__$l,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$l = {
  name: "ResourceEditor",
  props: {
    context: {
      type: Object,
      required: false,
    },
    resource: {
      required: false,
      type: String,
    },
    readonly: {
      required: false,
      default: false,
    },
    values: {
      required: false,
    },
  },
  data: function data() {
    return {
      headers: [],
      actions: [],
      fields: [],
      rows: [],
    };
  },
  mounted: function mounted() {
    var resourceName = "";

    if (this.context) {
      resourceName = this.context.attributes.resource.name;
      this.rows = _$1.clone(this.context.model || []);
    } else {
      resourceName = this.resource;
      this.rows = this.values;
    }

    this.headers = this.resources[resourceName].headers;
    this.actions = this.readonly ? [] : this.resources[resourceName].actions;
    this.fields = this.resources[resourceName].fields;
  },
  methods: {
    reloadRows: function reloadRows(rows) {
      this.context.model = null;
      this.context.model = rows;

      this.rows = null;
      this.rows = rows;

      console.log(rows);

      this.$forceUpdate();
    },
  },
  computed: {},
};

/* script */
var __vue_script__$l = script$l;

/* template */
var __vue_render__$m = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    [
      _c("awesome-table", {
        attrs: {
          debug: true,
          headers: _vm.headers,
          actions: _vm.actions,
          fields: _vm.fields,
          rows: _vm.rows,
          readonly: _vm.readonly
        },
        on: {
          "update:rows": function($event) {
            _vm.rows = $event;
          },
          "row-added": function($event) {
            return _vm.reloadRows($event)
          },
          "row-deleted": function($event) {
            return _vm.reloadRows($event)
          }
        }
      })
    ],
    1
  )
};
var __vue_staticRenderFns__$m = [];
__vue_render__$m._withStripped = true;

  /* style */
  var __vue_inject_styles__$m = undefined;
  /* scoped */
  var __vue_scope_id__$m = undefined;
  /* module identifier */
  var __vue_module_identifier__$m = undefined;
  /* functional template */
  var __vue_is_functional_template__$m = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$m = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$m, staticRenderFns: __vue_staticRenderFns__$m },
    __vue_inject_styles__$m,
    __vue_script__$l,
    __vue_scope_id__$m,
    __vue_is_functional_template__$m,
    __vue_module_identifier__$m,
    false,
    undefined,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$m = {
  name: "FieldView",
  props: {
    data: { required: true },
    field: { required: true }
  },
  components: {},
  data: function data() {
    return {
      example:
        '{"status":200,"error":"","data":[{"news_id":51184,"title":"iPhone X Review: Innovative future with real black technology","source":"Netease phone"},{"news_id":51183,"title":"Traffic paradise: How to design streets for people and unmanned vehicles in the future?","source":"Netease smart","link":"http://netease.smart/traffic-paradise/1235"},{"news_id":51182,"title":"Teslamasks American Business Relations: The government does not pay billions to build factories","source":"AI Finance","members":["Daniel","Mike","John"]}]}'
    };
  },
  mounted: function mounted() {},
  methods: {
    getFieldNameFromType: function getFieldNameFromType(field) {
      switch (field.type) {
        case "user":
          if (field.select.multi) {
            return field.field;
          }

          return field.field + ".text";
        case "select":
          return field.code + "." + field.select.option;
        default:
          return null;
      }
    }
  },
  computed: {
    value: function value() {
      var fieldName = this.getFieldNameFromType(this.field) || this.field.field;

      switch (this.field.type) {
        case "fieldset":
          return this.field.label;

        case "image_upload":
          return {
            "background-image":
              "url(" + this.deepPick(this.data, fieldName) + ")"
          };

        case "json":
          return;

        default:
          return this.deepPick(this.data, fieldName);
      }
    }
  }
};

/* script */
var __vue_script__$m = script$m;

/* template */
var __vue_render__$n = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", [
    ![undefined, null, ""].includes(_vm.value)
      ? _c("div", [
          _vm.field.type == "user" && !_vm.field.select.multi
            ? _c("span", [_vm._v("\n      " + _vm._s(_vm.value) + "\n    ")])
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "user" && _vm.field.select.multi
            ? _c(
                "span",
                _vm._l(_vm.value, function(customerData) {
                  return _c("div", { staticClass: "mb-2 text-gray-800" }, [
                    _vm._v(
                      "\n        " + _vm._s(customerData.text) + "\n      "
                    )
                  ])
                }),
                0
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "text"
            ? _c("span", [_vm._v(_vm._s(_vm.value))])
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "textarea"
            ? _c("span", [_vm._v(_vm._s(_vm.value))])
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "select"
            ? _c("span", [_vm._v(_vm._s(_vm.value))])
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "balance"
            ? _c("span", [_vm._v(_vm._s(_vm._f("round")(_vm.value)) + " €")])
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "date"
            ? _c("span", [
                _vm._v(
                  "\n      " +
                    _vm._s(_vm._f("date")(_vm.value, _vm.field.dateFormat)) +
                    "\n    "
                )
              ])
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "number"
            ? _c("span", [
                _vm._v(
                  _vm._s(_vm._f("round")(_vm.value, 2, _vm.field.udm)) +
                    " " +
                    _vm._s(_vm.field.udm)
                )
              ])
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "customer"
            ? _c("span", [
                _c(
                  "span",
                  {
                    staticClass: "text-blue-700 cursor-pointer hover:underline",
                    on: {
                      click: function($event) {
                        return _vm.goToCustomerDetail(_vm.field, _vm.data)
                      }
                    }
                  },
                  [_vm._v(_vm._s(_vm.value))]
                )
              ])
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "email"
            ? _c("span", [
                _c(
                  "a",
                  {
                    staticClass: "text-blue-700 hover:underline",
                    attrs: { href: "mailto:" + _vm.value }
                  },
                  [_vm._v("\n        " + _vm._s(_vm.value) + "\n      ")]
                )
              ])
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "boolean"
            ? _c("span", [
                _vm.value
                  ? _c("i", { staticClass: "text-green-700 fas fa-check" })
                  : _c("i", { staticClass: "text-red-700 fas fa-times" })
              ])
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "image_upload"
            ? _c("span", [
                _c("div", {
                  staticClass:
                    "flex items-center justify-center w-48 h-48 text-xl border-2 border-dashed rounded-full border-gray bg-gray-light",
                  style: _vm.value
                })
              ])
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "resource"
            ? _c(
                "span",
                [
                  _c("resource-editor", {
                    attrs: {
                      resource: _vm.field.resource.name,
                      readonly: true,
                      values: _vm.value
                    }
                  })
                ],
                1
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "fieldset" ? _c("span") : _vm._e(),
          _vm._v(" "),
          _vm.field.type == "survey"
            ? _c(
                "span",
                [
                  _c("resource-survey", {
                    attrs: {
                      context: { model: _vm.value, type: "survey" },
                      readonly: _vm.field.readonly
                    }
                  })
                ],
                1
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.$viewFields[_vm.field.type]
            ? _c(
                "div",
                [
                  _c(_vm.$viewFields[_vm.field.type], {
                    tag: "component",
                    attrs: {
                      context: _vm.field.context,
                      field: _vm.deepPick(_vm.data, _vm.field.field)
                    }
                  })
                ],
                1
              )
            : _vm._e()
        ])
      : _c("div", [
          _c("span", { staticClass: "text-gray-400" }, [
            _vm._v("Valore non impostato")
          ])
        ])
  ])
};
var __vue_staticRenderFns__$n = [];
__vue_render__$n._withStripped = true;

  /* style */
  var __vue_inject_styles__$n = undefined;
  /* scoped */
  var __vue_scope_id__$n = undefined;
  /* module identifier */
  var __vue_module_identifier__$n = undefined;
  /* functional template */
  var __vue_is_functional_template__$n = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$n = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$n, staticRenderFns: __vue_staticRenderFns__$n },
    __vue_inject_styles__$n,
    __vue_script__$m,
    __vue_scope_id__$n,
    __vue_is_functional_template__$n,
    __vue_module_identifier__$n,
    false,
    undefined,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$n = {
  name: 'FieldEdit',
  props: {
    header: {},
    value: {}
  },
  data: function data () {
    return {
      document: {},
      options: []
    }
  },
  computed: {
    docIsPresent: function docIsPresent () {
      return !!this.value[this.header.field]
    },
    filename: function filename () {
      var file = this.value[this.header.field].doc;

      return file ? file.filename : ''
    }
  },
  watch: {
    header: async function header (newVal, oldVal) {
      await this.fetchOptions();
    },
    value: function value (newVal, oldVal) {
      if (this.header.type == 'file') {
        this.document = null;
      }
    }
  },
  mounted: function mounted () {
    this.fetchOptions();
  },
  methods: {
    timeObjectToString: function timeObjectToString (evt, header) {
      this.value[header.field] = evt.HH + ':' + evt.mm;
    },
    fetchOptions: async function fetchOptions () {
      if (this.header.type == 'select' && this.header.select) {
        if (this.header.select.choices) {
          this.options = this.header.select.choices;
          return
        }

        try {
          this.options = await this.$api.params(this.header.select.url);
        } catch (err) {
          console.log(err);
        }
      }
    },
    formatDate: function formatDate (date) {
      if (!date) {
        return
      }

      if (typeof date === 'string') {
        return date.split(' ')[0]
      }

      return date.target.value
    },
    changeDate: function changeDate (date) {
      this.value[this.header.field] = date.target.value;

      var value = _.clone(this.value);

      this.$emit('input', value);
    },
    uploadFile: function uploadFile (f) {
      var this$1 = this;

      var reader = new FileReader();

      var file = this.document.files[0].file;

      reader.onload = function (e) {
        var value = _.clone(this$1.value);

        value[this$1.header.field] = {
          base64: btoa(reader.result),
          path: f.name,
          field: this$1.header.field,
          doc: {
            filename: f.name
          }
        };

        this$1.$emit('input', value);
      };

      reader.readAsBinaryString(file);
    },
    deleteFile: function deleteFile (value, field) {
      this.document = null;
      this.value[field] = null;

      this.$forceUpdate();
    }
  }
};

/* script */
var __vue_script__$n = script$n;

/* template */
var __vue_render__$o = function() {
  var _obj;
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      class:
        ((_obj = {}),
        (_obj["col-span-" + (_vm.header.colSpan || 12)] = true),
        (_obj["row-span-" + (_vm.header.rowSpan || 1)] = true),
        _obj)
    },
    [
      _c(
        "div",
        { staticClass: "flex flex-col" },
        [
          _c(
            "label",
            {
              staticClass: "font-semibold text-sm text-gray-600 mb-3",
              attrs: { for: _vm.header.field }
            },
            [
              _vm._v("\n      " + _vm._s(_vm.header.label) + "\n      "),
              _vm.header.validator &&
              _vm.header.validator.indexOf("required") != -1
                ? _c("span", { staticClass: "font-bold text-orange-600" }, [
                    _vm._v("\n        *\n      ")
                  ])
                : _vm._e()
            ]
          ),
          _vm._v(" "),
          _vm.header.type == "time"
            ? [
                _c("vue-timepicker", {
                  attrs: {
                    name: _vm.header.field,
                    "minute-interval": 5,
                    format: "HH:mm"
                  },
                  on: {
                    input: function($event) {
                      return _vm.timeObjectToString($event, _vm.header)
                    }
                  }
                })
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.header.type == "text"
            ? [
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.value[_vm.header.field],
                      expression: "value[header.field]"
                    }
                  ],
                  staticClass: "form-control w-full",
                  attrs: { type: "text", name: _vm.header.field },
                  domProps: { value: _vm.value[_vm.header.field] },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(_vm.value, _vm.header.field, $event.target.value);
                    }
                  }
                })
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.header.type == "number"
            ? [
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.value[_vm.header.field],
                      expression: "value[header.field]"
                    }
                  ],
                  staticClass: "form-control rounded-r-none flex-grow",
                  staticStyle: { "min-width": "1px" },
                  attrs: {
                    id: "amount",
                    type: "number",
                    name: "capital_amount"
                  },
                  domProps: { value: _vm.value[_vm.header.field] },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(_vm.value, _vm.header.field, $event.target.value);
                    }
                  }
                })
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.header.type == "amount"
            ? [
                _c("div", { staticClass: "flex" }, [
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.value[_vm.header.field],
                        expression: "value[header.field]"
                      }
                    ],
                    staticClass: "form-control rounded-r-none flex-grow",
                    staticStyle: { "min-width": "1px" },
                    attrs: { type: "number", name: _vm.header.field },
                    domProps: { value: _vm.value[_vm.header.field] },
                    on: {
                      input: function($event) {
                        if ($event.target.composing) {
                          return
                        }
                        _vm.$set(
                          _vm.value,
                          _vm.header.field,
                          $event.target.value
                        );
                      }
                    }
                  }),
                  _vm._v(" "),
                  _c(
                    "div",
                    {
                      staticClass:
                        "bg-gray-200 rounded rounded-l-none border border-gray-300 flex items-center border-l-0"
                    },
                    [
                      _c("span", { staticClass: "text-gray-600 px-3" }, [
                        _vm._v(
                          "\n            " +
                            _vm._s(_vm.header.udm || "€") +
                            "\n          "
                        )
                      ])
                    ]
                  )
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.header.type == "date"
            ? [
                _c("input", {
                  staticClass: "form-control rounded-r-none flex-grow",
                  attrs: { type: "date", name: _vm.header.field },
                  domProps: {
                    value: _vm.formatDate(_vm.value[_vm.header.field])
                  },
                  on: { change: _vm.changeDate }
                })
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.header.type == "select"
            ? [
                _c(
                  "select",
                  {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.value[_vm.header.field],
                        expression: "value[header.field]"
                      }
                    ],
                    staticClass: "form-control w-full",
                    attrs: { name: _vm.header.field },
                    on: {
                      change: function($event) {
                        var $$selectedVal = Array.prototype.filter
                          .call($event.target.options, function(o) {
                            return o.selected
                          })
                          .map(function(o) {
                            var val = "_value" in o ? o._value : o.value;
                            return val
                          });
                        _vm.$set(
                          _vm.value,
                          _vm.header.field,
                          $event.target.multiple
                            ? $$selectedVal
                            : $$selectedVal[0]
                        );
                      }
                    }
                  },
                  [
                    _c("option", { domProps: { value: undefined } }, [
                      _vm._v("\n          Scegli...\n        ")
                    ]),
                    _vm._v(" "),
                    _vm._l(_vm.options, function(option) {
                      return _c(
                        "option",
                        {
                          key: option.id,
                          domProps: {
                            value: option,
                            selected: _vm.value[_vm.header.field]
                              ? _vm.value[_vm.header.field].id == option.id
                              : false
                          }
                        },
                        [
                          _vm._v(
                            "\n          " +
                              _vm._s(
                                _vm.header.select.option
                                  ? _vm.deepPick(
                                      option,
                                      _vm.header.select.option
                                    )
                                  : option.description
                              ) +
                              "\n        "
                          )
                        ]
                      )
                    })
                  ],
                  2
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.header.type == "file"
            ? [
                _vm.docIsPresent
                  ? _c(
                      "span",
                      {
                        staticClass: "flex flex-row items-center py-2",
                        on: {
                          click: function($event) {
                            return _vm.deleteFile(_vm.value, _vm.header.field)
                          }
                        }
                      },
                      [
                        _vm._v(
                          "\n        " + _vm._s(_vm.filename) + "\n        "
                        ),
                        _c("i", {
                          staticClass:
                            "ml-6 fas fa-times text-red-600 cursor-pointer"
                        })
                      ]
                    )
                  : _c("FormulateInput", {
                      staticClass: "w-full",
                      staticStyle: { "max-height": "30px" },
                      attrs: { type: "file", uploader: _vm.uploadFile },
                      model: {
                        value: _vm.document,
                        callback: function($$v) {
                          _vm.document = $$v;
                        },
                        expression: "document"
                      }
                    })
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.header.type == "user"
            ? [
                _c("FormulateInput", {
                  key: _vm.header.field,
                  attrs: {
                    type: "dynamic-select",
                    name: _vm.header.field,
                    header: _vm.header
                  },
                  model: {
                    value: _vm.value[_vm.header.field],
                    callback: function($$v) {
                      _vm.$set(_vm.value, _vm.header.field, $$v);
                    },
                    expression: "value[header.field]"
                  }
                })
              ]
            : _vm._e()
        ],
        2
      )
    ]
  )
};
var __vue_staticRenderFns__$o = [];
__vue_render__$o._withStripped = true;

  /* style */
  var __vue_inject_styles__$o = undefined;
  /* scoped */
  var __vue_scope_id__$o = undefined;
  /* module identifier */
  var __vue_module_identifier__$o = undefined;
  /* functional template */
  var __vue_is_functional_template__$o = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$o = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$o, staticRenderFns: __vue_staticRenderFns__$o },
    __vue_inject_styles__$o,
    __vue_script__$n,
    __vue_scope_id__$o,
    __vue_is_functional_template__$o,
    __vue_module_identifier__$o,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$o = {
  name: "tab-view",
  props: {
    initialTabIndex: { required: false, default: null },
    externalTabs: { required: false }
  },
  data: function data() {
    return {
      basePath: "",
      currentResource: null,
      tabs: null,
      tabsFromRouter: false,
      currentTab: null
    };
  },
  beforeMount: function beforeMount() {
    this.fetchTabs();
  },
  mounted: function mounted() {
    var this$1 = this;

    if (this.tabsFromRouter && this.$route.params.resource) {
      this.currentResource = this.$route.params.resource;
      this.goToTab(this.tabs.find(function (tab) { return tab.code == this$1.currentResource; }));
      return;
    }

    if (!this.initialTabIndex) {
      this.goToTab(this.visibleTabs[0]);
      return;
    }

    this.goToTab(this.visibleTabs[this.initialTabIndex]);
  },
  methods: {
    fetchTabs: function fetchTabs() {
      if (this.externalTabs) {
        this.tabs = this.externalTabs;
        return;
      }

      this.tabsFromRouter = true;

      var routeWithTabDefinition = this.$route.matched.find(function (route) { return route.meta ? route.meta.tabs : null; }
      );

      this.basePath = routeWithTabDefinition.path;
      this.tabs = routeWithTabDefinition.meta.tabs || [];
    },
    goToTab: function goToTab(tab, fromTapAction) {
      if ( fromTapAction === void 0 ) fromTapAction = false;

      if (!tab) {
        return;
      }

      this.currentTab = tab;

      // Don't go to this tab if we're already there
      if (this.currentResource && this.currentResource == tab.code) {
        return;
      }

      if (this.tabsFromRouter) {
        this.$router.push({
          path: ((this.basePath) + "/" + (tab.code) + "/list")
        });
      }

      if (fromTapAction) {
        this.$emit("tab-change", tab);
      }
    }
  },
  computed: Object.assign({}, mapState("user", {
      user: function (state) { return state.user; }
    }),
    {visibleTabs: function visibleTabs() {
      var this$1 = this;

      return this.tabs.filter(function (tab) {
        if (!tab.roles) {
          return true;
        }

        return tab.roles.includes(this$1.getUserRole());
      });
    }}),
  watch: {}
};

/* script */
var __vue_script__$o = script$o;

/* template */
var __vue_render__$p = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    [
      _c("div", { class: _vm.$theme.tab_view.container }, [
        _vm.currentTab
          ? _c(
              "div",
              { class: _vm.$theme.tab_view.tab_container },
              _vm._l(_vm.visibleTabs, function(tab) {
                var _obj;
                return _c(
                  "div",
                  {
                    key: tab.label,
                    class:
                      ((_obj = {}),
                      (_obj[_vm.$theme.tab_view.active] =
                        _vm.currentTab.code == tab.code),
                      (_obj[_vm.$theme.tab_view.inactive] =
                        _vm.currentTab.code !== tab.code),
                      (_obj[_vm.$theme.tab_view.normal] = true),
                      _obj),
                    on: {
                      click: function($event) {
                        return _vm.goToTab(tab, true)
                      }
                    }
                  },
                  [
                    tab.icon
                      ? _c("i", {
                          staticClass: "mr-1 text-xs fas",
                          class: tab.icon
                        })
                      : _vm._e(),
                    _vm._v("\n        " + _vm._s(tab.label) + "\n      ")
                  ]
                )
              }),
              0
            )
          : _vm._e()
      ]),
      _vm._v(" "),
      _vm.tabsFromRouter ? _c("router-view") : _vm._e()
    ],
    1
  )
};
var __vue_staticRenderFns__$p = [];
__vue_render__$p._withStripped = true;

  /* style */
  var __vue_inject_styles__$p = function (inject) {
    if (!inject) { return }
    inject("data-v-2eda5116_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"TabView.vue"}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$p = undefined;
  /* module identifier */
  var __vue_module_identifier__$p = undefined;
  /* functional template */
  var __vue_is_functional_template__$p = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$p = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$p, staticRenderFns: __vue_staticRenderFns__$p },
    __vue_inject_styles__$p,
    __vue_script__$o,
    __vue_scope_id__$p,
    __vue_is_functional_template__$p,
    __vue_module_identifier__$p,
    false,
    createInjector,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$p = {
  name: "resource-select",
  props: {
    context: {
      type: Object,
      required: true
    }
  },
  data: function data() {
    return {
      weekDays: [
        {
          code: "monday",
          label: "L",
          index: 0
        },
        {
          code: "tuesday",
          label: "M",
          index: 1
        },
        {
          code: "wednesday",
          label: "M",
          index: 2
        },
        {
          code: "thursday",
          label: "G",
          index: 3
        },
        {
          code: "friday",
          label: "V",
          index: 4
        },
        {
          code: "saturday",
          label: "S",
          index: 5
        },
        {
          code: "sunday",
          label: "D",
          index: 6
        }
      ],
      recursivity: []
    };
  },
  mounted: function mounted() {
    this.recursivity = [0, 0, 0, 0, 0, 0, 0];

    if (this.context.model) {
      console.log(this.context.model);
      this.recursivity = this.context.model.split(",");
    }
  },
  methods: {
    toggleWeekDay: function toggleWeekDay(day) {
      this.recursivity[day.index] = this.recursivity[day.index] == 1 ? 0 : 1;
      this.$forceUpdate();

      this.context.model = null;
      this.context.model = this.recursivity.join(",");
    }
  }
};

/* script */
var __vue_script__$p = script$p;

/* template */
var __vue_render__$q = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "flex flex-row form-control",
      attrs: { "data-type": _vm.context.type }
    },
    _vm._l(_vm.weekDays, function(day) {
      return _c(
        "div",
        {
          key: day.code,
          staticClass:
            "flex-grow items-center flex cursor-pointer justify-center",
          on: {
            click: function($event) {
              return _vm.toggleWeekDay(day)
            }
          }
        },
        [
          _c(
            "label",
            { staticClass: "mr-2 cursor-pointer", attrs: { for: day.code } },
            [_vm._v(_vm._s(day.label))]
          ),
          _vm._v(" "),
          _c("div", {}, [
            _c("div", {
              staticClass: "w-5 h-5 border-2 border-blue cursor-pointer",
              class: {
                "bg-blue": _vm.recursivity[day.index] == 1,
                "bg-white": _vm.recursivity[day.index] == 0
              }
            })
          ])
        ]
      )
    }),
    0
  )
};
var __vue_staticRenderFns__$q = [];
__vue_render__$q._withStripped = true;

  /* style */
  var __vue_inject_styles__$q = undefined;
  /* scoped */
  var __vue_scope_id__$q = undefined;
  /* module identifier */
  var __vue_module_identifier__$q = undefined;
  /* functional template */
  var __vue_is_functional_template__$q = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$q = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$q, staticRenderFns: __vue_staticRenderFns__$q },
    __vue_inject_styles__$q,
    __vue_script__$p,
    __vue_scope_id__$q,
    __vue_is_functional_template__$q,
    __vue_module_identifier__$q,
    false,
    undefined,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$q = {
  name: "RecursivityView",
  props: {
    week: { required: true }
  },
  mounted: function mounted() {
    this.load();
  },
  data: function data() {
    return {
      weekDays: [
        {
          code: "monday",
          label: "L",
          index: 0
        },
        {
          code: "tuesday",
          label: "M",
          index: 1
        },
        {
          code: "wednesday",
          label: "M",
          index: 2
        },
        {
          code: "thursday",
          label: "G",
          index: 3
        },
        {
          code: "friday",
          label: "V",
          index: 4
        },
        {
          code: "saturday",
          label: "S",
          index: 5
        },
        {
          code: "sunday",
          label: "D",
          index: 6
        }
      ],
      recursivity: []
    };
  },
  methods: {
    load: function load() {
      this.recursivity = [0, 0, 0, 0, 0, 0, 0];

      if (this.week) {
        this.recursivity = this.week.split(",");
      }
    }
  },
  watch: {
    week: function week() {
      this.load();
    }
  }
};

/* script */
var __vue_script__$q = script$q;

/* template */
var __vue_render__$r = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "flex flex-row" },
    _vm._l(_vm.weekDays, function(day) {
      return _c(
        "div",
        {
          key: day.code,
          staticClass:
            "flex-grow items-center flex cursor-pointer justify-center"
        },
        [
          _c("div", {}, [
            _c(
              "div",
              {
                staticClass:
                  "w-5 h-5 border-2 cursor-pointer mr-1 rounded-full flex items-center justify-center text-sm",
                class: {
                  "bg-blue text-white border-blue":
                    _vm.recursivity[day.index] == 1,
                  "bg-gray-light text-gray-dark border-gray-light":
                    _vm.recursivity[day.index] == 0
                }
              },
              [_vm._v("\n        " + _vm._s(day.label) + "\n      ")]
            )
          ])
        ]
      )
    }),
    0
  )
};
var __vue_staticRenderFns__$r = [];
__vue_render__$r._withStripped = true;

  /* style */
  var __vue_inject_styles__$r = undefined;
  /* scoped */
  var __vue_scope_id__$r = undefined;
  /* module identifier */
  var __vue_module_identifier__$r = undefined;
  /* functional template */
  var __vue_is_functional_template__$r = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$r = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$r, staticRenderFns: __vue_staticRenderFns__$r },
    __vue_inject_styles__$r,
    __vue_script__$q,
    __vue_scope_id__$r,
    __vue_is_functional_template__$r,
    __vue_module_identifier__$r,
    false,
    undefined,
    undefined,
    undefined
  );

//

var rest_resources = {
  profile: "users",
};

var script$r = {
  name: "ResourceEdit",
  props: {
    component: { required: false, default: false },
    propResourceName: {
      required: false,
      type: String,
      default: null,
    },
    propResourceId: {
      required: false,
      type: Number,
      default: null,
    },
    layout: {
      required: false,
      default: "vertical",
    },
    debug: {
      required: false,
      default: false,
    },
    hideActions: {
      required: false,
      default: false,
    },
  },
  data: function data() {
    return {
      resourceErrors: null,
      changedResource: {},
      error: null,
      loading: true,
      resource: {},
      resource_rest_name: null,
      resource_name: null,
      actions: [],
      is_edit: false,
      valid: false,
      routerBased: true,
    };
  },
  mounted: async function mounted() {
    this.loading = true;

    if (this.propResourceName) {
      this.routerBased = false;
      this.resource_id = this.propResourceId;
      this.resource_name = this.propResourceName;
    } else {
      this.resource_id = this.$route.params.id;
      this.resource_name =
        this.$route.params.resource || this.$route.meta.resource;
    }

    this.resource_rest_name =
      rest_resources[this.resource_name] || this.resource_name;

    this.actions = this.resources[this.resource_name].actions || [];

    if (this.debug) {
      this.log("ResourceName: " + this.resource_name);
      this.log("ResourceId: " + this.resource_id);
    }

    if (this.resource_id) {
      this.is_edit = true;
      this.resource = await this.$api.get(
        this.resource_rest_name,
        this.resource_id
      );
    }

    this.loading = false;
  },
  methods: {
    saveResource: async function saveResource() {
      var this$1 = this;

      this.resourceErrors = null;
      var resource_name = this.resource_rest_name || this.resource_name;

      try {
        if (this.is_edit) {
          await this.$api.update(
            resource_name,
            this.resource_id,
            this.changedResource
          );
        } else {
          var resource = _.clone(this.changedResource);
          await this.$api.create(resource_name, resource);
          if (!this.routerBased) {
            this.$emit("save", true);
            return;
          }
        }

        this.$router.back();
      } catch (err) {
        console.log(err);

        if (err.errors) {
          this.resourceErrors = [];

          Object.keys(err.errors).map(function (e) {
            console.log(err.errors[e]);
            this$1.resourceErrors = this$1.resourceErrors.concat(err.errors[e]);
          });

          return;
        }

        switch (err.message) {
          case "The given data was invalid.":
            this.error = "Alcuni campi non sono validi.";
            break;

          default:
            this.error = "Ops! C'è stato un errore.";
        }
      }
    },
    retry: async function retry() {
      this.error = null;

      await this.saveResource();
    },
    back: function back() {
      if (!this.routerBased) {
        this.$emit("close");
        return;
      }

      this.$router.back();
    },
    updateResource: function updateResource(newResource) {
      if (this.debug) {
        this.log("NewResource");
        this.log(newResource);
      }

      this.changedResource = newResource;
    },
    act: function act(action) {
      if (this[action.callback]) {
        this[action.callback]();
      }
    },
    delete: function delete$1() {
      if (confirm("Vuoi davvero eliminare questa risorsa?")) {
        this.isLoading = true;
        this.$api.delete(this.resource_name, this.resource_id);
        this.isLoading = false;

        this.$router.push("../list");
      }
    },
  },
  computed: Object.assign({}, mapState("user", {
      user: function (state) { return state.user; },
    }),
    {form_fields: function form_fields() {
      var fields = this.resources[this.resource_name].fields || [];

      return fields.filter(function (field) {
        if (!field.scopes) {
          return true;
        }

        return field.scopes.includes("edit");
      });
    },
    button_label: function button_label() {
      return this.is_edit ? "Conferma" : "Conferma";
    },
    action_name: function action_name() {
      return this.is_edit ? "Modifica" : "Nuova";
    },
    resourceInfo: function resourceInfo() {
      return this.resources[this.resource_name].info || {};
    },
    options: function options() {
      return this.resourceInfo.singular || "Risorsa";
    },
    visibleActions: function visibleActions() {
      var this$1 = this;

      return this.actions.filter(function (action) {
        return (
          !action.scopes ||
          action.scopes.includes(this$1.is_edit ? "edit" : "create")
        );
      });
    }}),
};

/* script */
var __vue_script__$r = script$r;

/* template */
var __vue_render__$s = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass:
        "flex flex-col items-center overflow-hidden rounded align-center"
    },
    [
      _vm.loading ? _c("loading", { staticClass: "w-full my-16" }) : _vm._e(),
      _vm._v(" "),
      !_vm.loading
        ? _c("div", { staticClass: "w-full mx-auto max-w-screen-xl" }, [
            _c(
              "div",
              {},
              [
                !_vm.loading
                  ? _c("awesome-form", {
                      staticClass: "py-5",
                      attrs: {
                        debug: _vm.debug,
                        form: _vm.resource,
                        is_edit: _vm.is_edit,
                        headers: _vm.form_fields,
                        validate: true,
                        layout: _vm.layout
                      },
                      on: {
                        "update:form": function($event) {
                          _vm.resource = $event;
                        },
                        valid: function(_valid) {
                          return (_vm.valid = _valid)
                        },
                        change: _vm.updateResource
                      }
                    })
                  : _vm._e(),
                _vm._v(" "),
                _vm.resourceErrors
                  ? _c(
                      "div",
                      { staticClass: "px-12 pb-5 text-red-600 text-semibold" },
                      [
                        _vm._v(
                          "\n        Ci sono alcuni errori nella form:\n        "
                        ),
                        _c(
                          "ol",
                          { staticClass: "mt-2 list-outside" },
                          _vm._l(_vm.resourceErrors, function(error) {
                            return _c(
                              "li",
                              {
                                key: error,
                                staticClass: "flex flex-row items-center"
                              },
                              [
                                _c("div", {
                                  staticClass:
                                    "w-2 h-2 mr-2 bg-red-600 rounded-full"
                                }),
                                _vm._v(" "),
                                _c("div", [_vm._v(_vm._s(error))])
                              ]
                            )
                          }),
                          0
                        )
                      ]
                    )
                  : _vm._e(),
                _vm._v(" "),
                !_vm.hideActions
                  ? _c(
                      "div",
                      {
                        staticClass:
                          "flex flex-row items-center justify-end w-full py-5"
                      },
                      [
                        _c(
                          "div",
                          {
                            staticClass: "flex flex-row items-baseline mr-auto"
                          },
                          _vm._l(_vm.visibleActions, function(action) {
                            return _c(
                              "button",
                              {
                                key: action.label,
                                staticClass:
                                  "\n              px-4\n              ml-3 ml-auto\n              text-white\n              rounded-none\n              outline-none\n              focus:outline-none\n            ",
                                class: "bg-" + action.color,
                                on: {
                                  click: function($event) {
                                    return _vm.act(action)
                                  }
                                }
                              },
                              [
                                _c(
                                  "span",
                                  {
                                    staticClass: "flex flex-row justify-center"
                                  },
                                  [
                                    _c("i", {
                                      staticClass: "mt-1 mr-2 text-md",
                                      class: action.icon
                                    }),
                                    _vm._v(" "),
                                    _c("span", [_vm._v(_vm._s(action.label))])
                                  ]
                                )
                              ]
                            )
                          }),
                          0
                        ),
                        _vm._v(" "),
                        !_vm.error
                          ? [
                              _c(
                                "button",
                                {
                                  staticClass:
                                    "mr-3 active:outline-none focus:outline-none",
                                  class: _vm.$theme.backButtonClass,
                                  on: { click: _vm.back }
                                },
                                [_vm._v("\n            Chiudi\n          ")]
                              ),
                              _vm._v(" "),
                              _c(
                                "button",
                                {
                                  staticClass:
                                    "transition duration-300 ease-in-out",
                                  class: _vm.$theme.saveButtonClass,
                                  attrs: { disabled: !_vm.valid },
                                  on: {
                                    click: function($event) {
                                      return _vm.saveResource()
                                    }
                                  }
                                },
                                [
                                  _vm._v(
                                    "\n            " +
                                      _vm._s(_vm.button_label) +
                                      "\n          "
                                  )
                                ]
                              )
                            ]
                          : [
                              _c(
                                "p",
                                { staticClass: "text-red-600 text-weigth-600" },
                                [
                                  _vm._v(
                                    "\n            " +
                                      _vm._s(_vm.error) +
                                      "\n          "
                                  )
                                ]
                              ),
                              _vm._v(" "),
                              _c(
                                "button",
                                {
                                  staticClass: "ml-auto btn btn-primary",
                                  on: {
                                    click: function($event) {
                                      return _vm.retry()
                                    }
                                  }
                                },
                                [
                                  _c("i", {
                                    staticClass: "mr-2 fas fa-redo-alt"
                                  }),
                                  _vm._v(" "),
                                  _c("span", [_vm._v("Riprova")])
                                ]
                              )
                            ]
                      ],
                      2
                    )
                  : _vm._e()
              ],
              1
            )
          ])
        : _vm._e()
    ],
    1
  )
};
var __vue_staticRenderFns__$s = [];
__vue_render__$s._withStripped = true;

  /* style */
  var __vue_inject_styles__$s = function (inject) {
    if (!inject) { return }
    inject("data-v-14fdf32b_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"EditResource.vue"}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$s = undefined;
  /* module identifier */
  var __vue_module_identifier__$s = undefined;
  /* functional template */
  var __vue_is_functional_template__$s = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$s = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$s, staticRenderFns: __vue_staticRenderFns__$s },
    __vue_inject_styles__$s,
    __vue_script__$r,
    __vue_scope_id__$s,
    __vue_is_functional_template__$s,
    __vue_module_identifier__$s,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script$s = {
  name: 'ListResourceBase',
  mixins: [ActionsMixin],
  props: {
    tableClass: {
      required: false,
      type: String,
      default: function default$1 () {
        return this.$theme.tableClass
      }
    },
    headerClass: {
      required: false,
      type: String,
      default: 'bg-gray-500 text-white'
    },
    rowClass: {
      required: false,
      type: String,
      default: 'bg-gray-100 text-gray-700'
    },
    multiActionClass: {
      required: false,
      type: String,
      default: 'bg-gray-100 text-gray-700'
    },
    striped: {
      required: false,
      type: Boolean,
      default: false
    },
    paginationClasses: {
      required: false,
      type: Object,
      default: function default$2 () {
        return this.$theme.paginationClasses
      }
    }
  },
  data: function data () {
    return {
      actionScope: 'list',
      pagination: null,
      currentPage: 1,
      isLoading: true,
      dataLoading: true,
      searchQuery: null,
      rows: null,
      headers: null,
      actions: null,
      filters: {},
      resourceName: null,
      resourceIsLoading: false,
      baseConfig: {
        canAdd: true
      }
    }
  },
  computed: {},
  mounted: async function mounted () {
    this.resourceName =
      this.$route.params.resource || this.$route.meta.resource;

    if (!this.resourceName) {
      return
    }

    this.headers = this.resources[this.resourceName].headers || [];
    this.actions = this.resources[this.resourceName].actions || [];
    this.resourceInfo = this.resources[this.resourceName].info || {};
    this.config = this.resources[this.resourceName].config || this.baseConfig;

    this.isLoading = true;
    await this.loadData();
    this.isLoading = false;
  },
  methods: {
    search: _.debounce(async function () {
      // When searching "reset" pagination
      this.currentPage = 1;
      await this.loadData();
    }, 350),
    changePage: async function changePage (newCurrentPage) {
      this.currentPage = newCurrentPage;
      await this.loadData();
    },
    loadData: async function loadData () {
      this.dataLoading = true;
      try {
        var response = await this.$api.list(this.resourceName, {
          q: this.searchQuery,
          filters: this.filters,
          page: this.currentPage
        });

        if (response.data) {
          this.pagination = {
            totalItems: response.total,
            perPage: response.per_page
          };

          this.rows = response.data;
        } else {
          this.rows = response || [];
        }
      } catch (e) {
        this.rows = [];
      }

      this.dataLoading = false;
    },
    filterData: async function filterData (filters) {
      this.filters = filters;
      await this.loadData();
    },
    addResource: function addResource () {
      this.$router.push({
        name: ("create_" + (this.resourceName))
      });
    },
    view: function view (resource) {
      this.$router.push({
        name: ("view_" + (this.resourceName)),
        params: {
          id: resource.id
        }
      });
    },
    edit: function edit (resource) {
      this.$router.push({
        name: ("edit_" + (this.resourceName)),
        params: {
          id: resource.id
        }
      });
    },
    delete: async function delete$1 (resource) {
      if (confirm('Vuoi davvero eliminare questa risorsa?')) {
        this.isLoading = true;
        this.$api.delete(this.resourceName, resource.id);
        this.isLoading = false;

        await this.loadData();
      }
    }
  }
};

/* script */
var __vue_script__$s = script$s;

/* template */
var __vue_render__$t = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "flex flex-col flex-grow" },
    [
      !_vm.isLoading
        ? _c(
            "div",
            { staticClass: "w-full" },
            [
              _c(
                "div",
                { staticClass: "flex flex-row items-baseline py-5" },
                [
                  _vm._t("title"),
                  _vm._v(" "),
                  _c(
                    "div",
                    { staticClass: "flex flex-row ml-auto" },
                    _vm._l(_vm.multiActions, function(action, index) {
                      return _c(
                        "button",
                        {
                          staticClass: "outline-none focus:outline-none",
                          class: _vm.multiActionClass,
                          on: {
                            click: function($event) {
                              return _vm.act(action)
                            }
                          }
                        },
                        [
                          _c(
                            "span",
                            { staticClass: "flex flex-row items-center" },
                            [
                              _c("icon", {
                                staticClass: "mr-1",
                                attrs: {
                                  name: action.icon,
                                  color: "text-white",
                                  size: "m"
                                }
                              }),
                              _vm._v(" "),
                              _c("span", [_vm._v(_vm._s(action.label))])
                            ],
                            1
                          )
                        ]
                      )
                    }),
                    0
                  )
                ],
                2
              ),
              _vm._v(" "),
              _c(
                "div",
                { staticClass: "flex flex-row items-center my-3" },
                [
                  _c("search-input", {
                    staticClass: "flex-grow",
                    attrs: { placeholder: "Cerca" },
                    on: { input: _vm.search },
                    model: {
                      value: _vm.searchQuery,
                      callback: function($$v) {
                        _vm.searchQuery = $$v;
                      },
                      expression: "searchQuery"
                    }
                  })
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "div",
                { staticClass: "flex flex-row items-center my-3" },
                [_vm._t("filters", null, { filterData: _vm.filterData })],
                2
              ),
              _vm._v(" "),
              !_vm.dataLoading
                ? _c(
                    "div",
                    { staticClass: "my-3" },
                    [
                      !_vm.resourceIsLoading
                        ? _c("awesome-table", {
                            attrs: {
                              "header-class": _vm.headerClass,
                              "table-class": _vm.tableClass,
                              "row-class": _vm.rowClass,
                              striped: _vm.striped,
                              headers: _vm.headers,
                              actions: _vm.scopedActions,
                              rows: _vm.rows
                            },
                            on: { act: _vm.actOnRow }
                          })
                        : _vm._e(),
                      _vm._v(" "),
                      _vm.pagination
                        ? _c(
                            "div",
                            { staticClass: "flex flex-row w-full my-3" },
                            [
                              _c("t-pagination", {
                                staticClass: "mx-auto",
                                attrs: {
                                  "total-items": _vm.pagination.totalItems,
                                  "per-page": _vm.pagination.perPage,
                                  "num-pages": _vm.pagination.numPages,
                                  limit: 5,
                                  classes: _vm.paginationClasses,
                                  value: _vm.currentPage
                                },
                                on: { change: _vm.changePage }
                              })
                            ],
                            1
                          )
                        : _vm._e()
                    ],
                    1
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.dataLoading
                ? _c("loading", { staticClass: "flex-grow w-full h-64" })
                : _vm._e()
            ],
            1
          )
        : _vm._e(),
      _vm._v(" "),
      _vm.isLoading
        ? _c("loading", { staticClass: "flex-grow w-full h-64" })
        : _vm._e()
    ],
    1
  )
};
var __vue_staticRenderFns__$t = [];
__vue_render__$t._withStripped = true;

  /* style */
  var __vue_inject_styles__$t = undefined;
  /* scoped */
  var __vue_scope_id__$t = undefined;
  /* module identifier */
  var __vue_module_identifier__$t = undefined;
  /* functional template */
  var __vue_is_functional_template__$t = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$t = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$t, staticRenderFns: __vue_staticRenderFns__$t },
    __vue_inject_styles__$t,
    __vue_script__$s,
    __vue_scope_id__$t,
    __vue_is_functional_template__$t,
    __vue_module_identifier__$t,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$t = {
  name: "resource-json",
  props: {
    context: {
      type: Object,
      required: true
    }
  },
  components: {
    PrismEditor: PrismEditor
  },
  data: function data() {
    return {
      options: {
        confirmText: "confirm",
        cancelText: "cancel"
      },
      jsonData: null
    };
  },
  beforeMount: function beforeMount() {},
  mounted: function mounted() {
    this.jsonData = this.context.model
      ? JSON.stringify(JSON.parse(this.context.model), null, 2)
      : "";
    this.log(this.jsonData);
  },
  methods: {
    onJsonChange: function onJsonChange(json) {
      this.log("on-json-change", json);
      this.jsonData = json;
      try {
        this.context.model = JSON.parse(this.jsonData);
      } catch (e) {
        this.log(e);
      }
    }
  },
  computed: {
    sel_config: function sel_config() {
      return this.header.select;
    },
    model: function model() {
      return JSON.stringify(this.jsonData, null, "\t");
    },
    header: function header() {
      return this.context.attributes.header;
    },
    attributes: function attributes() {
      return this.context.attributes;
    }
  },
  watch: {}
};

/* script */
var __vue_script__$t = script$t;

/* template */
var __vue_render__$u = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { attrs: { "data-type": _vm.context.type } },
    [
      _c("prism-editor", {
        attrs: { code: _vm.jsonData, language: "js" },
        on: { change: _vm.onJsonChange }
      })
    ],
    1
  )
};
var __vue_staticRenderFns__$u = [];
__vue_render__$u._withStripped = true;

  /* style */
  var __vue_inject_styles__$u = undefined;
  /* scoped */
  var __vue_scope_id__$u = undefined;
  /* module identifier */
  var __vue_module_identifier__$u = undefined;
  /* functional template */
  var __vue_is_functional_template__$u = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$u = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$u, staticRenderFns: __vue_staticRenderFns__$u },
    __vue_inject_styles__$u,
    __vue_script__$t,
    __vue_scope_id__$u,
    __vue_is_functional_template__$u,
    __vue_module_identifier__$u,
    false,
    undefined,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$u = {
  name: "FileUploader",
  props: {
    type: { required: false, default: "file" },
    extensions: {
      required: false,
      default: function default$1() {
        return [];
      }
    }
  },
  data: function data() {
    return {
      image: "",
      file: "",
      fileSrc: "",
      isLoading: false,
      dragActive: false,
      dragAndDropCapable: false
    };
  },
  mounted: function mounted() {
    this.dragAndDropCapable = this.detectDragAndDropCapable();

    if (this.dragAndDropCapable) {
      [
        "drag",
        "dragstart",
        "dragend",
        "dragover",
        "dragenter",
        "dragleave",
        "drop"
      ].forEach(
        function(evt) {
          this.$refs.fileform.addEventListener(
            evt,
            function(e) {
              e.preventDefault();
              e.stopPropagation();
            }.bind(this),
            false
          );
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "dragenter",
        function() {
          this.dragActive = true;
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "dragleave",
        function() {
          this.dragActive = false;
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "drop",
        function(e) {
          // Take only last file
          this.handleInputChange(e);
        }.bind(this)
      );
    }
  },
  methods: {
    handleInputChange: function(evt) {
      if (evt.dataTransfer) {
        this.file = evt.dataTransfer.files[0];
      } else {
        this.file = this.$refs.hiddenInput.files[0];
      }

      this.isLoading = true;
      this.dragActive = false;

      var reader = new FileReader();

      reader.addEventListener(
        "load",
        function() {
          this.fileSrc = reader.result;
          this.isLoading = false;

          console.log(this.file);
          this.$emit("input", this.file);

          this.$forceUpdate();
        }.bind(this),
        false
      );

      reader.readAsDataURL(this.file);
    },
    openFileChooser: function() {
      this.$refs.hiddenInput.click();
    },
    detectDragAndDropCapable: function() {
      var div = document.createElement("div");

      return (
        ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
        "FormData" in window &&
        "FileReader" in window
      );
    }
  },
  computed: {
    backgroundStyle: function backgroundStyle() {
      var borderRadius = this.type == "image" ? "50%" : "15px";
      var backgroundImage =
        this.type == "image" ? "url(" + this.imageSrc + ")" : "none";
      var height = this.type == "image" ? "300px" : "300px";
      var width = this.type == "image" ? "300px" : "450px";

      return {
        "border-radius": borderRadius,
        "background-image": backgroundImage,
        height: height,
        width: width
      };
    }
  }
};

/* script */
var __vue_script__$u = script$u;

/* template */
var __vue_render__$v = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", [
    _c("p", { staticClass: "text-lg" }, [
      _vm._v("\n    Trascina e rilascia\n    "),
      _vm.type == "image" ? _c("span", [_vm._v("un'immagine")]) : _vm._e(),
      _vm._v(" "),
      _vm.type == "file" ? _c("span", [_vm._v("un file")]) : _vm._e(),
      _vm._v("\n    nell'area grigia.\n    "),
      _c("br"),
      _vm._v(
        "\n    Oppure clicca al suo interno per caricare direttamente\n    "
      ),
      _vm.type == "image" ? _c("span", [_vm._v("un'immagine")]) : _vm._e(),
      _vm._v(" "),
      _vm.type == "file" ? _c("span", [_vm._v("un file")]) : _vm._e(),
      _vm._v("\n    .\n  ")
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "flex items-center justify-center" }, [
      _c(
        "div",
        {
          ref: "fileform",
          staticClass:
            "mt-8 flex items-center justify-center text-lg h-56 w-full rounded border-2 border-dashed border-gray-light cursor-pointer",
          class: { "drag-active": _vm.dragActive },
          on: {
            click: function($event) {
              return _vm.openFileChooser()
            }
          }
        },
        [
          !_vm.isLoading && !_vm.file
            ? _c("span", { staticClass: "drop-files text-gray-light" }, [
                _vm._v("\n        Trascina qui i file o clicca\n      ")
              ])
            : _vm._e(),
          _vm._v(" "),
          _vm.file && !_vm.isLoading
            ? _c("span", [
                _c("div", { staticClass: "flex items-center justify-center" }, [
                  _c("i", { staticClass: "ti-file mr-2" }),
                  _vm._v("\n          Stai caricando il file "),
                  _c("br"),
                  _vm._v("\n          " + _vm._s(_vm.file.name) + "\n        ")
                ])
              ])
            : _vm._e(),
          _vm._v(" "),
          _vm.isLoading
            ? _c("span", [_vm._v("\n        Caricamento...\n      ")])
            : _vm._e()
        ]
      ),
      _vm._v(" "),
      _c("input", {
        ref: "hiddenInput",
        staticStyle: { display: "none" },
        attrs: { type: "file", accept: _vm.extensions.join(",") },
        on: {
          change: function($event) {
            return _vm.handleInputChange($event)
          }
        }
      })
    ])
  ])
};
var __vue_staticRenderFns__$v = [];
__vue_render__$v._withStripped = true;

  /* style */
  var __vue_inject_styles__$v = undefined;
  /* scoped */
  var __vue_scope_id__$v = undefined;
  /* module identifier */
  var __vue_module_identifier__$v = undefined;
  /* functional template */
  var __vue_is_functional_template__$v = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$v = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$v, staticRenderFns: __vue_staticRenderFns__$v },
    __vue_inject_styles__$v,
    __vue_script__$u,
    __vue_scope_id__$v,
    __vue_is_functional_template__$v,
    __vue_module_identifier__$v,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$v = {
  name: "SideNav",
  props: {
    bgColor: { required: false, default: "bg-white", type: String },
    shadow: { required: false, default: "shadow-xs", type: String },
    width: { required: false, default: "sm:w-16", type: String },
  },
  data: function () { return ({
    value: 0,
    item: 0,
    mini_variant: false,
    selected_action: {},
  }); },
  computed: Object.assign({}, mapState("user", {
      user: function (state) { return state.user; },
    }),
    {currentPath: function currentPath() {
      return this.$router.name;
    },
    items: function items() {
      var this$1 = this;

      if (!this.$routes.length) {
        return [];
      }

      return this.$routes
        .filter(function (route) {
          // Only routes with the meta.label have to be present
          // in the SideNav
          return route.meta && route.meta.label !== undefined;
        })
        .filter(function (route) {
          if (route.meta.roles) {
            if (!this$1.user) {
              return false;
            }

            var userRole = this$1.getUserRole();

            return route.meta.roles.includes(userRole);
          }

          return true;
        });
    },
    version: function version() {
      return this.APPLICATION_VERSION;
    },
    routesNames: function routesNames() {
      return this.$route.matched
        .filter(function (l) {
          return l.meta && l.meta.sectionName;
        })
        .map(function (l) { return l.meta.sectionName; });
    }}),
  beforeMount: function beforeMount() {
    this.listenForSideNavCollapseEvent();
  },
  mounted: function mounted() {},
  methods: {
    doUserAction: function doUserAction(action) {
      this.$router.push(action.path);
    },
    navigateTo: function navigateTo(link) {
      // Don't navigate to same route or root route
      if (
        link.path != this.$route.name &&
        link.path != this.$route.redirectedFrom
      ) {
        if (this.is_mobile) {
          this.collapseSideBar();
        }
        if (link.name) {
          this.$router.push({
            name: link.name,
          });
        } else {
          this.$router.push(link.path);
        }
      }
    },
    linkIsCurrentLink: function linkIsCurrentLink(link) {
      if (link.name) {
        return this.$route.matched.map(function (l) { return l.name; }).indexOf(link.name) != -1;
      }
      if (link.meta && link.meta.sectionName) {
        return this.routesNames.includes(link.meta.sectionName);
      }
    },
  },
};

/* script */
var __vue_script__$v = script$v;

/* template */
var __vue_render__$w = function() {
  var _obj;
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass:
        "fixed left-0 z-20 flex flex-col h-full top-14 sm:top-0 transition-all duration-200 ease-in",
      class:
        ((_obj = {}),
        (_obj[_vm.bgColor] = true),
        (_obj[_vm.shadow] = true),
        (_obj[_vm.width] = true),
        (_obj["hidden sm:block"] = _vm.is_collapsed),
        (_obj["w-full sm:w-64"] = !_vm.is_collapsed),
        (_obj["right-0"] = _vm.is_mobile),
        _obj)
    },
    [
      [
        _vm._t(
          "logo",
          function() {
            return [
              !_vm.is_mobile
                ? _c("div", {
                    staticClass:
                      "flex flex-col justify-center h-12 pt-3 text-xl font-medium text-center"
                  })
                : _vm._e()
            ]
          },
          { is_collapsed: !_vm.show_text }
        )
      ],
      _vm._v(" "),
      _c("div", { staticClass: "flex flex-col flex-grow mt-8" }, [
        _c(
          "div",
          { staticClass: "flex flex-col flex-grow-0 pt-0 sm:pt-6" },
          _vm._l(_vm.items, function(item) {
            return _c(
              "div",
              {
                key: item.meta.label,
                staticClass: "nav-link",
                class: {
                  selected: _vm.linkIsCurrentLink(item)
                },
                on: {
                  click: function($event) {
                    return _vm.navigateTo(item)
                  }
                }
              },
              [
                _vm._t(
                  "nav-item",
                  function() {
                    return [
                      _vm._v(
                        "\n          " + _vm._s(item.meta.label) + "\n        "
                      )
                    ]
                  },
                  {
                    selected: _vm.linkIsCurrentLink(item),
                    item: item,
                    is_collapsed: !_vm.show_text
                  }
                )
              ],
              2
            )
          }),
          0
        )
      ]),
      _vm._v(" "),
      !_vm.is_collapsed && _vm.version
        ? _c("div", { staticClass: "py-2 mt-auto text-center text-blue" }, [
            _c("span", [_vm._v("versione")]),
            _vm._v(" "),
            _c("span", [_vm._v(_vm._s(_vm.version))])
          ])
        : _vm._e()
    ],
    2
  )
};
var __vue_staticRenderFns__$w = [];
__vue_render__$w._withStripped = true;

  /* style */
  var __vue_inject_styles__$w = function (inject) {
    if (!inject) { return }
    inject("data-v-3d68ab40_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n/* ----------------------------------------------\n* Generated by Animista on 2020-3-16 10:24:13\n* Licensed under FreeBSD License.\n* See http://animista.net/license for more info.\n* w: http://animista.net, t: @cssanimista\n* ---------------------------------------------- */\n\n/**\n* ----------------------------------------\n* animation rotate-90-cw\n* ----------------------------------------\n*/\n.rotate-initial-cw {\n  transition: all 0.35s 0.1s;\n  transform: rotate(180deg);\n}\n.rotate-0-cw {\n  transform: rotate(180deg);\n}\n.rotate-180-cw {\n  transform: rotate(0deg);\n}\n", map: {"version":3,"sources":["/app/estia/src/components/SideNav.vue"],"names":[],"mappings":";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;AAsJA;;;;;kDAKA;;AAEA;;;;CAIA;AAEA;EACA,0BAAA;EACA,yBAAA;AACA;AAEA;EACA,yBAAA;AACA;AAEA;EACA,uBAAA;AACA","file":"SideNav.vue","sourcesContent":["<template>\n  <div\n    class=\"fixed left-0 z-20 flex flex-col h-full top-14 sm:top-0 transition-all duration-200 ease-in\"\n    :class=\"{\n      [bgColor]: true,\n      [shadow]: true,\n      [width]: true,\n      'hidden sm:block': is_collapsed,\n      'w-full sm:w-64': !is_collapsed,\n      'right-0': is_mobile,\n    }\"\n  >\n    <template>\n      <slot name=\"logo\" :is_collapsed=\"!show_text\">\n        <div\n          v-if=\"!is_mobile\"\n          class=\"flex flex-col justify-center h-12 pt-3 text-xl font-medium text-center\"\n        />\n      </slot>\n    </template>\n    <div class=\"flex flex-col flex-grow mt-8\">\n      <div class=\"flex flex-col flex-grow-0 pt-0 sm:pt-6\">\n        <div\n          v-for=\"item in items\"\n          :key=\"item.meta.label\"\n          class=\"nav-link\"\n          :class=\"{\n            selected: linkIsCurrentLink(item),\n          }\"\n          @click=\"navigateTo(item)\"\n        >\n          <slot\n            name=\"nav-item\"\n            :selected=\"linkIsCurrentLink(item)\"\n            :item=\"item\"\n            :is_collapsed=\"!show_text\"\n          >\n            {{ item.meta.label }}\n          </slot>\n        </div>\n      </div>\n    </div>\n    <div\n      v-if=\"!is_collapsed && version\"\n      class=\"py-2 mt-auto text-center text-blue\"\n    >\n      <span>versione</span>\n      <span>{{ version }}</span>\n    </div>\n  </div>\n</template>\n\n<script>\nimport { mapState } from \"vuex\";\n\nexport default {\n  name: \"SideNav\",\n  props: {\n    bgColor: { required: false, default: \"bg-white\", type: String },\n    shadow: { required: false, default: \"shadow-xs\", type: String },\n    width: { required: false, default: \"sm:w-16\", type: String },\n  },\n  data: () => ({\n    value: 0,\n    item: 0,\n    mini_variant: false,\n    selected_action: {},\n  }),\n  computed: {\n    ...mapState(\"user\", {\n      user: (state) => state.user,\n    }),\n    currentPath() {\n      return this.$router.name;\n    },\n    items() {\n      if (!this.$routes.length) {\n        return [];\n      }\n\n      return this.$routes\n        .filter((route) => {\n          // Only routes with the meta.label have to be present\n          // in the SideNav\n          return route.meta && route.meta.label !== undefined;\n        })\n        .filter((route) => {\n          if (route.meta.roles) {\n            if (!this.user) {\n              return false;\n            }\n\n            let userRole = this.getUserRole();\n\n            return route.meta.roles.includes(userRole);\n          }\n\n          return true;\n        });\n    },\n    version() {\n      return this.APPLICATION_VERSION;\n    },\n    routesNames() {\n      return this.$route.matched\n        .filter((l) => {\n          return l.meta && l.meta.sectionName;\n        })\n        .map((l) => l.meta.sectionName);\n    },\n  },\n  beforeMount() {\n    this.listenForSideNavCollapseEvent();\n  },\n  mounted() {},\n  methods: {\n    doUserAction(action) {\n      this.$router.push(action.path);\n    },\n    navigateTo(link) {\n      // Don't navigate to same route or root route\n      if (\n        link.path != this.$route.name &&\n        link.path != this.$route.redirectedFrom\n      ) {\n        if (this.is_mobile) {\n          this.collapseSideBar();\n        }\n        if (link.name) {\n          this.$router.push({\n            name: link.name,\n          });\n        } else {\n          this.$router.push(link.path);\n        }\n      }\n    },\n    linkIsCurrentLink(link) {\n      if (link.name) {\n        return this.$route.matched.map((l) => l.name).indexOf(link.name) != -1;\n      }\n      if (link.meta && link.meta.sectionName) {\n        return this.routesNames.includes(link.meta.sectionName);\n      }\n    },\n  },\n};\n</script>\n\n<style>\n/* ----------------------------------------------\n* Generated by Animista on 2020-3-16 10:24:13\n* Licensed under FreeBSD License.\n* See http://animista.net/license for more info.\n* w: http://animista.net, t: @cssanimista\n* ---------------------------------------------- */\n\n/**\n* ----------------------------------------\n* animation rotate-90-cw\n* ----------------------------------------\n*/\n\n.rotate-initial-cw {\n  transition: all 0.35s 0.1s;\n  transform: rotate(180deg);\n}\n\n.rotate-0-cw {\n  transform: rotate(180deg);\n}\n\n.rotate-180-cw {\n  transform: rotate(0deg);\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$w = undefined;
  /* module identifier */
  var __vue_module_identifier__$w = undefined;
  /* functional template */
  var __vue_is_functional_template__$w = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$w = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$w, staticRenderFns: __vue_staticRenderFns__$w },
    __vue_inject_styles__$w,
    __vue_script__$v,
    __vue_scope_id__$w,
    __vue_is_functional_template__$w,
    __vue_module_identifier__$w,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script$w = {
  name: "TopBar",
  props: {
    shift: { required: false, default: "sm:w-16", type: String },
  },
  mixins: [SideNavMixin],
  data: function () { return ({
    showUserMenu: false,
    userActions: [
      {
        label: "Logout",
        icon: "hi-lock-open",
        callback: "logout",
        roles: ["*"]
      }
    ]
  }); },
  beforeMount: function beforeMount() {
    this.reloadUser();
    this.EventBus.$on("reload-user", this.reloadUser);
    this.listenForSideNavCollapseEvent();
  },
  methods: Object.assign({}, mapActions("user", ["set_user", "set_token"]),
    {toggleUserMenu: function toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    doUserAction: function doUserAction(action) {
      console.log(action);
      this.showUserMenu = false;

      if (this[action.callback] != null) {
        this[action.callback]();
      }
    },
    logout: function logout() {
      this.$router.push("./logout");
    },
    logoutUser: function logoutUser() {
      this.remove_logged_account();
      this.$router.push("/users");
    },
    reloadUser: async function reloadUser() {
      var user = getProfile();
      this.set_user(user);
    }}),
  computed: Object.assign({}, mapState("user", {
      user: function (state) { return state.user; }
    }),
    mapState("page_info", {
      updated_at: function (state) { return state.updated_at || state.last_updated; },
      post_num: function (state) { return state.post_num; },
      story_num: function (state) { return state.story_num; }
    }),
    mapGetters("page_info", ["reference_period"]),
    {fullName: function fullName() {
      return this.user.name + " " + this.user.surname;
    },
    actions: function actions() {
      var this$1 = this;

      return this.userActions.filter(function (action) {
        if (action.roles.includes("*")) {
          return true;
        }

        return action.roles.includes(this$1.getUserRole());
      });
    }})
};

/* script */
var __vue_script__$w = script$w;

/* template */
var __vue_render__$x = function() {
  var _obj;
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass:
        "h-12 w-full fixed left-0 right-0 top-0 z-10 flex flex-row items-center justify-between duration-200 transition-all ease-in",
      class: ((_obj = {}), (_obj[_vm.shift] = true), _obj)
    },
    [
      _c(
        "div",
        [
          _vm._t(
            "collapse",
            function() {
              return [
                _c(
                  "span",
                  {
                    staticClass: "ml-3 hover:underline cursor-pointer",
                    on: {
                      click: function($event) {
                        return _vm.collapseSideBar()
                      }
                    }
                  },
                  [_vm._v(_vm._s(_vm.is_collapsed ? "Espandi" : "Chiudi"))]
                )
              ]
            },
            {
              is_collapsed: _vm.is_collapsed,
              collapseSideBar: _vm.collapseSideBar
            }
          )
        ],
        2
      ),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "block sm:hidden h-full flex flex-row items-center" },
        [_vm._t("logo")],
        2
      ),
      _vm._v(" "),
      _c("div", { staticClass: "flex flex-row" }, [
        _vm.user
          ? _c(
              "div",
              [
                _vm._t("userinfo", null, {
                  user: _vm.user,
                  actions: _vm.actions,
                  doUserAction: _vm.doUserAction
                })
              ],
              2
            )
          : _vm._e()
      ])
    ]
  )
};
var __vue_staticRenderFns__$x = [];
__vue_render__$x._withStripped = true;

  /* style */
  var __vue_inject_styles__$x = function (inject) {
    if (!inject) { return }
    inject("data-v-9257c120_0", { source: "\n.slide-fade-enter-active {\n  transition: all 0.05s ease;\n}\n.slide-fade-leave-active {\n  transition: all 0.05s cubic-bezier(1, 0.5, 0.8, 1);\n}\n.slide-fade-enter, .slide-fade-leave-to\n/* .slide-fade-leave-active for <2.1.8 */ {\n  transform: translateX(2px);\n  opacity: 0;\n}\n", map: {"version":3,"sources":["/app/estia/src/components/TopBar.vue"],"names":[],"mappings":";AAiHA;EACA,0BAAA;AACA;AACA;EACA,kDAAA;AACA;AACA;;EAEA,0BAAA;EACA,UAAA;AACA","file":"TopBar.vue","sourcesContent":["<template>\n  <div\n    class=\"h-12 w-full fixed left-0 right-0 top-0 z-10 flex flex-row items-center justify-between duration-200 transition-all ease-in\"\n    :class=\"{ [shift]: true}\"\n  >\n    <div>\n      <slot\n        name=\"collapse\"\n        :is_collapsed=\"is_collapsed\"\n        :collapseSideBar=\"collapseSideBar\"\n      >\n        <span\n          class=\"ml-3 hover:underline cursor-pointer\"\n          @click=\"collapseSideBar()\"\n          >{{ is_collapsed ? \"Espandi\" : \"Chiudi\" }}</span\n        >\n      </slot>\n    </div>\n    <div class=\"block sm:hidden h-full flex flex-row items-center\">\n      <slot name=\"logo\" />\n    </div>\n    <div class=\"flex flex-row\">\n      <div v-if=\"user\">\n        <slot\n          name=\"userinfo\"\n          :user=\"user\"\n          :actions=\"actions\"\n          :doUserAction=\"doUserAction\"\n        />\n      </div>\n    </div>\n  </div>\n</template>\n\n<script>\nimport { getProfile } from \"@/utils/auth\";\nimport SideNavMixin from \"@/mixins/sidenav.mixin.js\";\nimport { mapActions, mapGetters, mapState, mapMutations } from \"vuex\";\n\nexport default {\n  name: \"TopBar\",\n  props: {\n    shift: { required: false, default: \"sm:w-16\", type: String },\n  },\n  mixins: [SideNavMixin],\n  data: () => ({\n    showUserMenu: false,\n    userActions: [\n      {\n        label: \"Logout\",\n        icon: \"hi-lock-open\",\n        callback: \"logout\",\n        roles: [\"*\"]\n      }\n    ]\n  }),\n  beforeMount() {\n    this.reloadUser();\n    this.EventBus.$on(\"reload-user\", this.reloadUser);\n    this.listenForSideNavCollapseEvent();\n  },\n  methods: {\n    ...mapActions(\"user\", [\"set_user\", \"set_token\"]),\n    toggleUserMenu() {\n      this.showUserMenu = !this.showUserMenu;\n    },\n    doUserAction(action) {\n      console.log(action);\n      this.showUserMenu = false;\n\n      if (this[action.callback] != null) {\n        this[action.callback]();\n      }\n    },\n    logout() {\n      this.$router.push(\"./logout\");\n    },\n    logoutUser() {\n      this.remove_logged_account();\n      this.$router.push(\"/users\");\n    },\n    async reloadUser() {\n      let user = getProfile();\n      this.set_user(user);\n    }\n  },\n  computed: {\n    ...mapState(\"user\", {\n      user: state => state.user\n    }),\n    ...mapState(\"page_info\", {\n      updated_at: state => state.updated_at || state.last_updated,\n      post_num: state => state.post_num,\n      story_num: state => state.story_num\n    }),\n    ...mapGetters(\"page_info\", [\"reference_period\"]),\n    fullName() {\n      return this.user.name + \" \" + this.user.surname;\n    },\n    actions() {\n      return this.userActions.filter(action => {\n        if (action.roles.includes(\"*\")) {\n          return true;\n        }\n\n        return action.roles.includes(this.getUserRole());\n      });\n    }\n  }\n};\n</script>\n\n<style>\n.slide-fade-enter-active {\n  transition: all 0.05s ease;\n}\n.slide-fade-leave-active {\n  transition: all 0.05s cubic-bezier(1, 0.5, 0.8, 1);\n}\n.slide-fade-enter, .slide-fade-leave-to\n/* .slide-fade-leave-active for <2.1.8 */ {\n  transform: translateX(2px);\n  opacity: 0;\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$x = undefined;
  /* module identifier */
  var __vue_module_identifier__$x = undefined;
  /* functional template */
  var __vue_is_functional_template__$x = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$x = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$x, staticRenderFns: __vue_staticRenderFns__$x },
    __vue_inject_styles__$x,
    __vue_script__$w,
    __vue_scope_id__$x,
    __vue_is_functional_template__$x,
    __vue_module_identifier__$x,
    false,
    createInjector,
    undefined,
    undefined
  );

/* script */

/* template */
var __vue_render__$y = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("router-view")
};
var __vue_staticRenderFns__$y = [];
__vue_render__$y._withStripped = true;

  /* style */
  var __vue_inject_styles__$y = undefined;
  /* scoped */
  var __vue_scope_id__$y = undefined;
  /* module identifier */
  var __vue_module_identifier__$y = undefined;
  /* functional template */
  var __vue_is_functional_template__$y = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$y = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$y, staticRenderFns: __vue_staticRenderFns__$y },
    __vue_inject_styles__$y,
    {},
    __vue_scope_id__$y,
    __vue_is_functional_template__$y,
    __vue_module_identifier__$y,
    false,
    undefined,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$x = {
  name: "ViewResource",
  props: {
    id: { type: Number, default: null },
    resourceNameProp: { type: String, default: null }
  },
  data: function data() {
    return {
      scope: "view",
      isLoading: true,
      headers: null,
      actions: null,
      resource: null
    };
  },
  computed: {
    newResourceLabel: function newResourceLabel() {
      return "Nuova";

      /*
      let newResourceLabel = "Aggiungi ";
      newResourceLabel += this.resourceInfo.singular ?? "Risorsa";

      return newResourceLabel;
      */
    },
    resourceName: function resourceName() {
      var resourceNameField = this.resourceInfo
        ? this.resourceInfo.singular
        : null;

      return resourceNameField || "Risorsa";
    },
    visibleActions: function visibleActions() {
      return this.actions.filter(function (action) {
        return !action.scopes || action.scopes.includes("view");
      });
    },
    visibleHeaders: function visibleHeaders() {
      var this$1 = this;

      return this.headers.filter(function (header) { return this$1.fieldIsVisible(header, this$1.resource); }
      );
    }
  },
  mounted: async function mounted() {
    var resourceName =
      this.resourceNameProp ||
      this.$route.meta.resource ||
      this.$route.params.resource;

    var resourceId = this.id || this.$route.params.id;

    this.isLoading = true;

    this.resource = (await this.$api.get(resourceName, resourceId)) || {};

    this.headers = this.resources[resourceName].fields || [];

    this.actions = this.resources[resourceName].actions || [];
    this.resourceInfo = this.resources[resourceName].info || {};

    this.isLoading = false;
  },
  methods: {
    fieldIsVisible: function fieldIsVisible(header) {
      var this$1 = this;

      this.log(header);
      var isRoleVisible = true;
      var isFilterVisible = true;
      var isScopeVisible = true;

      if (header.roles) {
        isRoleVisible = header.roles.includes(this.getUserRole());
      }

      if (header.visible) {
        header.visible.forEach(function (condition) {
          isFilterVisible =
            isFilterVisible && this$1.evaluateCondition(condition, this$1.resource);
        });
      }

      if (header.scopes) {
        isScopeVisible = header.scopes.includes(this.scope);
      }

      return isRoleVisible && isFilterVisible && isScopeVisible;
    },
    labelClass: function labelClass(header) {
      var cssClass = "";

      switch (header.type) {
        case "form":
          cssClass = "text-gray-700 text-normal";
          break;

        case "fieldset":
          cssClass = "text-gray-dark text-xl font-bold my-5";
          break;

        default:
          cssClass = "text-gray-600 text-sm";
          break;
      }

      return cssClass;
    },
    edit: function edit() {
      this.$router.push("../edit/" + this.resource.id);
    },
    delete: function delete$1() {},
    goToList: function goToList() {
      this.$router.push("../list");
    }
  }
};

/* script */
var __vue_script__$x = script$x;

/* template */
var __vue_render__$z = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { class: _vm.$theme.viewResource.container },
    [
      !_vm.isLoading
        ? _c("div", { staticClass: "w-full" }, [
            _c("div", { staticClass: "flex flex-row mb-8" }, [
              _c(
                "div",
                {
                  staticClass: "flex flex-row items-baseline ml-auto py-4",
                  class: _vm.$theme.viewResource.actionWrapper
                },
                _vm._l(_vm.visibleActions, function(action) {
                  return _c(
                    "button",
                    {
                      key: action.label,
                      staticClass:
                        "ml-3 px-4 outline-none ml-auto focus:outline-none",
                      class: [_vm.$theme.viewResource.action, action.class],
                      on: {
                        click: function($event) {
                          return _vm.act(action, _vm.resource)
                        }
                      }
                    },
                    [
                      _c(
                        "span",
                        { staticClass: "flex flex-row justify-center" },
                        [
                          _vm.$icon == "fontawesome"
                            ? _c("i", {
                                staticClass: "mr-2 mt-1 text-md",
                                class: action.icon
                              })
                            : _vm.$icon == "heroicons"
                            ? _c("icon", {
                                staticClass: "mr-2 mt-1 text-md",
                                attrs: { name: action.icon }
                              })
                            : _vm._e(),
                          _vm._v(" "),
                          _c("span", [_vm._v(_vm._s(action.label))])
                        ],
                        1
                      )
                    ]
                  )
                }),
                0
              )
            ]),
            _vm._v(" "),
            _c(
              "div",
              {
                staticClass: "grid grid-cols-12 gap-x-4",
                class: _vm.$theme.viewResource.infoContainer
              },
              _vm._l(_vm.visibleHeaders, function(header, index) {
                return _c(
                  "div",
                  {
                    key: index,
                    staticClass: "focus-within:text-blue",
                    class:
                      header.type == "form"
                        ? "border border-rounded-sm border-dotted border-gray-light"
                        : "mb-5 flex flex-col col-span-" +
                          (header.colSpan || 12) +
                          " row-span-" +
                          (header.rowSpan || 1)
                  },
                  [
                    _c(
                      "label",
                      {
                        staticClass: "font-semibold mb-2 text-blue",
                        class: _vm.labelClass(header),
                        attrs: { for: header.code }
                      },
                      [
                        _vm._v(
                          "\n          " + _vm._s(header.label) + "\n        "
                        )
                      ]
                    ),
                    _vm._v(" "),
                    _c("field-view", {
                      attrs: { data: _vm.resource, field: header }
                    })
                  ],
                  1
                )
              }),
              0
            )
          ])
        : _vm._e(),
      _vm._v(" "),
      _vm.isLoading
        ? _c("loading", { staticClass: "flex-grow w-full h-64" })
        : _vm._e()
    ],
    1
  )
};
var __vue_staticRenderFns__$z = [];
__vue_render__$z._withStripped = true;

  /* style */
  var __vue_inject_styles__$z = undefined;
  /* scoped */
  var __vue_scope_id__$z = undefined;
  /* module identifier */
  var __vue_module_identifier__$z = undefined;
  /* functional template */
  var __vue_is_functional_template__$z = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$z = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$z, staticRenderFns: __vue_staticRenderFns__$z },
    __vue_inject_styles__$z,
    __vue_script__$x,
    __vue_scope_id__$z,
    __vue_is_functional_template__$z,
    __vue_module_identifier__$z,
    false,
    undefined,
    undefined,
    undefined
  );

//

var script$y = {
  name: "SearchInput",
  props: {
    value: {
      type: String,
      required: false
    },
    placeholder: {
      type: String,
      required: false,
      default: "Cerca"
    },
    mode: {
      type: String,
      required: false,
      default: "enter",
      validator: function (mode) {
        return ["enter", "debounce"].includes(mode);
      }
    }
  },
  data: function data() {
    return {
      inputValue: null
    };
  },
  mounted: async function mounted() {
    this.inputValue = this.value;
  },
  methods: {
    onInput: function onInput(value) {
      if (this.mode == "debounce" && this.inputValue) {
        this.debounceInput(this.debounce);
      }
    },
    onEnter: function onEnter() {
      if (this.mode == "enter" && this.inputValue) {
        this.$emit("input", this.inputValue);
      }
    },
    debounceInput: _$1.debounce(function() {
      this.$emit("input", this.inputValue);
    }, 350),
    clearInput: function clearInput() {
      this.inputValue = null;
      this.$emit("input", this.inputValue);
    },
    focusInput: function focusInput() {
      this.$refs.input.focus();
    }
  },
  computed: {}
};

/* script */
var __vue_script__$y = script$y;

/* template */
var __vue_render__$A = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", [
    _c(
      "div",
      {
        staticClass:
          "px-2 py-2 h-12 text-sm border-2 border-gray-300 rounded flex flex-row items-center bg-white cursor-text",
        on: {
          click: function($event) {
            return _vm.focusInput()
          }
        }
      },
      [
        _c("icon", {
          staticClass: "mr-3",
          attrs: { name: "search", color: "text-gray-300", size: "l" }
        }),
        _vm._v(" "),
        _c("input", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.inputValue,
              expression: "inputValue"
            }
          ],
          ref: "input",
          staticClass:
            "m-0 p-0 bg-transparent border-none focus:outline-none active:outline-none",
          staticStyle: { height: "initial" },
          attrs: { type: "text", placeholder: _vm.placeholder },
          domProps: { value: _vm.inputValue },
          on: {
            input: [
              function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.inputValue = $event.target.value;
              },
              _vm.onInput
            ],
            keyup: function($event) {
              if (
                !$event.type.indexOf("key") &&
                _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
              ) {
                return null
              }
              return _vm.onEnter.apply(null, arguments)
            }
          }
        }),
        _vm._v(" "),
        _c(
          "span",
          {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.inputValue,
                expression: "inputValue"
              }
            ],
            staticClass: "text-xs text-gray-400 cursor-pointer",
            on: {
              click: function($event) {
                return _vm.clearInput()
              }
            }
          },
          [_vm._v("\n      Cancella\n    ")]
        )
      ],
      1
    )
  ])
};
var __vue_staticRenderFns__$A = [];
__vue_render__$A._withStripped = true;

  /* style */
  var __vue_inject_styles__$A = undefined;
  /* scoped */
  var __vue_scope_id__$A = undefined;
  /* module identifier */
  var __vue_module_identifier__$A = undefined;
  /* functional template */
  var __vue_is_functional_template__$A = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$A = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$A, staticRenderFns: __vue_staticRenderFns__$A },
    __vue_inject_styles__$A,
    __vue_script__$y,
    __vue_scope_id__$A,
    __vue_is_functional_template__$A,
    __vue_module_identifier__$A,
    false,
    undefined,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$z = {};

/* script */
var __vue_script__$z = script$z;

/* template */
var __vue_render__$B = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "p-3 rounded flex flex-col items-center justify-center" },
    [
      _vm._t("icon", function() {
        return [
          _c(
            "svg",
            {
              staticClass: "px-10",
              attrs: {
                id: "b21613c9-2bf0-4d37-bef0-3b193d34fc5d",
                "data-name": "Layer 1",
                xmlns: "http://www.w3.org/2000/svg",
                width: "347.63626",
                height: "332.17383",
                viewBox: "0 0 647.63626 632.17383"
              }
            },
            [
              _c("path", {
                attrs: {
                  d:
                    "M687.3279,276.08691H512.81813a15.01828,15.01828,0,0,0-15,15v387.85l-2,.61005-42.81006,13.11a8.00676,8.00676,0,0,1-9.98974-5.31L315.678,271.39691a8.00313,8.00313,0,0,1,5.31006-9.99l65.97022-20.2,191.25-58.54,65.96972-20.2a7.98927,7.98927,0,0,1,9.99024,5.3l32.5498,106.32Z",
                  transform: "translate(-276.18187 -133.91309)",
                  fill: "#f2f2f2"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M725.408,274.08691l-39.23-128.14a16.99368,16.99368,0,0,0-21.23-11.28l-92.75,28.39L380.95827,221.60693l-92.75,28.4a17.0152,17.0152,0,0,0-11.28028,21.23l134.08008,437.93a17.02661,17.02661,0,0,0,16.26026,12.03,16.78926,16.78926,0,0,0,4.96972-.75l63.58008-19.46,2-.62v-2.09l-2,.61-64.16992,19.65a15.01489,15.01489,0,0,1-18.73-9.95l-134.06983-437.94a14.97935,14.97935,0,0,1,9.94971-18.73l92.75-28.4,191.24024-58.54,92.75-28.4a15.15551,15.15551,0,0,1,4.40966-.66,15.01461,15.01461,0,0,1,14.32032,10.61l39.0498,127.56.62012,2h2.08008Z",
                  transform: "translate(-276.18187 -133.91309)",
                  fill: "#3f3d56"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M398.86279,261.73389a9.0157,9.0157,0,0,1-8.61133-6.3667l-12.88037-42.07178a8.99884,8.99884,0,0,1,5.9712-11.24023l175.939-53.86377a9.00867,9.00867,0,0,1,11.24072,5.9707l12.88037,42.07227a9.01029,9.01029,0,0,1-5.9707,11.24072L401.49219,261.33887A8.976,8.976,0,0,1,398.86279,261.73389Z",
                  transform: "translate(-276.18187 -133.91309)",
                  fill: "#48bb78"
                }
              }),
              _vm._v(" "),
              _c("circle", {
                attrs: {
                  cx: "190.15351",
                  cy: "24.95465",
                  r: "20",
                  fill: "#48bb78"
                }
              }),
              _vm._v(" "),
              _c("circle", {
                attrs: {
                  cx: "190.15351",
                  cy: "24.95465",
                  r: "12.66462",
                  fill: "#fff"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M878.81836,716.08691h-338a8.50981,8.50981,0,0,1-8.5-8.5v-405a8.50951,8.50951,0,0,1,8.5-8.5h338a8.50982,8.50982,0,0,1,8.5,8.5v405A8.51013,8.51013,0,0,1,878.81836,716.08691Z",
                  transform: "translate(-276.18187 -133.91309)",
                  fill: "#e6e6e6"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M723.31813,274.08691h-210.5a17.02411,17.02411,0,0,0-17,17v407.8l2-.61v-407.19a15.01828,15.01828,0,0,1,15-15H723.93825Zm183.5,0h-394a17.02411,17.02411,0,0,0-17,17v458a17.0241,17.0241,0,0,0,17,17h394a17.0241,17.0241,0,0,0,17-17v-458A17.02411,17.02411,0,0,0,906.81813,274.08691Zm15,475a15.01828,15.01828,0,0,1-15,15h-394a15.01828,15.01828,0,0,1-15-15v-458a15.01828,15.01828,0,0,1,15-15h394a15.01828,15.01828,0,0,1,15,15Z",
                  transform: "translate(-276.18187 -133.91309)",
                  fill: "#3f3d56"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M801.81836,318.08691h-184a9.01015,9.01015,0,0,1-9-9v-44a9.01016,9.01016,0,0,1,9-9h184a9.01016,9.01016,0,0,1,9,9v44A9.01015,9.01015,0,0,1,801.81836,318.08691Z",
                  transform: "translate(-276.18187 -133.91309)",
                  fill: "#48bb78"
                }
              }),
              _vm._v(" "),
              _c("circle", {
                attrs: {
                  cx: "433.63626",
                  cy: "105.17383",
                  r: "20",
                  fill: "#48bb78"
                }
              }),
              _vm._v(" "),
              _c("circle", {
                attrs: {
                  cx: "433.63626",
                  cy: "105.17383",
                  r: "12.18187",
                  fill: "#fff"
                }
              })
            ]
          )
        ]
      }),
      _vm._v(" "),
      _vm._t("message", function() {
        return [
          _c(
            "span",
            { staticClass: "text-center text-gray-400 font-semibold" },
            [
              _vm._v(
                "\n      Sembra che non ci siano ancora dati da analizzare.\n    "
              )
            ]
          )
        ]
      })
    ],
    2
  )
};
var __vue_staticRenderFns__$B = [];
__vue_render__$B._withStripped = true;

  /* style */
  var __vue_inject_styles__$B = function (inject) {
    if (!inject) { return }
    inject("data-v-44353342_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"NoData.vue"}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$B = undefined;
  /* module identifier */
  var __vue_module_identifier__$B = undefined;
  /* functional template */
  var __vue_is_functional_template__$B = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$B = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$B, staticRenderFns: __vue_staticRenderFns__$B },
    __vue_inject_styles__$B,
    __vue_script__$z,
    __vue_scope_id__$B,
    __vue_is_functional_template__$B,
    __vue_module_identifier__$B,
    false,
    createInjector,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$A = {
  name: "DatePicker",
  props: {
    context: {
      type: Object,
      required: true
    }
  },
  mounted: function mounted() {},
  data: function data() {
    return {};
  },
  methods: {
    updateDate: function updateDate($event) {
      this.context.model = this.formatDate($event);
    },
    formatDate: function formatDate(newDate) {
      return this.moment(newDate).format("YYYY-MM-DD");
    }
  },
  computed: {}
};

/* script */
var __vue_script__$A = script$A;

/* template */
var __vue_render__$C = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {},
    [
      _c("v-date-picker", {
        attrs: {
          locale: "it",
          "min-date": _vm.context.attributes.header.minDate,
          value: _vm.context.model,
          popover: { visibility: "click" }
        },
        on: { input: _vm.updateDate },
        scopedSlots: _vm._u([
          {
            key: "default",
            fn: function(ref) {
              var inputValue = ref.inputValue;
              var inputEvents = ref.inputEvents;
              return [
                _c(
                  "input",
                  _vm._g({ domProps: { value: inputValue } }, inputEvents)
                )
              ]
            }
          }
        ])
      })
    ],
    1
  )
};
var __vue_staticRenderFns__$C = [];
__vue_render__$C._withStripped = true;

  /* style */
  var __vue_inject_styles__$C = undefined;
  /* scoped */
  var __vue_scope_id__$C = undefined;
  /* module identifier */
  var __vue_module_identifier__$C = undefined;
  /* functional template */
  var __vue_is_functional_template__$C = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$C = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$C, staticRenderFns: __vue_staticRenderFns__$C },
    __vue_inject_styles__$C,
    __vue_script__$A,
    __vue_scope_id__$C,
    __vue_is_functional_template__$C,
    __vue_module_identifier__$C,
    false,
    undefined,
    undefined,
    undefined
  );

function components (Vue) {
  Vue.component('login', __vue_component__$3);
  Vue.component('loading', __vue_component__$9);
  Vue.component('chart', __vue_component__$a);
  Vue.component('awesome-table', __vue_component__$d);
  Vue.component('color-swatch', __vue_component__$e);
  Vue.component('avatar', __vue_component__$f);
  Vue.component('horizontal-pie-chart', __vue_component__$g);
  Vue.component('aw-datepicker', DateRangePicker);
  Vue.component('blr-image', __vue_component__$h);
  Vue.component('svg-icon', __vue_component__$c);
  Vue.component('page-error', __vue_component__$i);
  Vue.component('error-boundary', __vue_component__$j);
  Vue.component('awesome-form', __vue_component__$k);
  Vue.component('resource-select', __vue_component__$l);
  Vue.component('field-view', __vue_component__$n);
  Vue.component('resource-editor', __vue_component__$m);
  Vue.component('field-edit', __vue_component__$o);
  Vue.component('vue-timepicker', VueTimepicker);
  Vue.component('tab-view', __vue_component__$p);
  Vue.component('recursivity-picker', __vue_component__$q);
  Vue.component('recursivity-view', __vue_component__$r);
  Vue.component('resource-edit', __vue_component__$s);
  Vue.component('resource-json', __vue_component__$u);
  // Vue.component("resource-survey", ResourceSurvey);
  Vue.component('resource-image-uploader', __vue_component__$8);
  Vue.component('file-uploader', __vue_component__$v);
  Vue.component('side-nav', __vue_component__$w);
  Vue.component('top-bar', __vue_component__$x);
  Vue.component('popper', __vue_component__$b);
  Vue.component('list-resource-base', __vue_component__$t);
  Vue.component('view-resource', __vue_component__$z);
  Vue.component('search-input', __vue_component__$A);
  Vue.component('no-data', __vue_component__$B);
  Vue.component('date-picker', __vue_component__$C);
}

var Validators = {
  email: function email(value, context) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value).toLowerCase());
  },
  fiscal_code: function fiscal_code(value, context) {
    if (!value) {
      return false;
    }

    console.log(value);

    try {
      var codiceFiscale = new CodiceFiscale(value);
      console.log("codice fiscale: ", codiceFiscale);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  vat_number: function vat_number(value, context) {
    if (!value) {
      return false;
    }

    return checkVAT(value, [italy]);
  }
};

var main = {
  install: function install(Vue, options) {
    Vue.prototype.$api = api(options);
    Vue.prototype.EventBus = EventBus;
    Vue.prototype.$theme = theme(options);
    Vue.prototype.$actions = options.actions ? options.actions : {};
    Vue.prototype.$moment = moment;
    Vue.prototype.$roleLookup = options.roleLookup;
    Vue.prototype.$icon = options.icon || "heroicons";
    Vue.prototype.$validators = Validators;

    components(Vue);
    mixins(Vue);
    plugins(Vue);
    filters$1(Vue, options.filters || {});
    resources(Vue, options.resources || {});
    store(Vue, options.store);
    viewFields(Vue, options);
    editFields(Vue, options);
    modalWidgets(Vue, options);

    Object.keys(helpers).forEach(function (key) { return (Vue.prototype[key] = helpers[key]); });

    Vue.use(VueFormulate, {
      library: {
        "resource-select": {
          component: "resource-select"
        },
        resource: {
          component: "resource-editor"
        },
        "recursivity-picker": {
          component: "recursivity-picker"
        },
        json: {
          component: "resource-json"
        },
        "image-uploader": {
          component: "resource-image-uploader"
        },
        date: {
          component: "date-picker"
        }
      }
    });

    Vue.use(VueSVGIcon);
    Vue.use(VueTailwind, {
      "t-pagination": {
        component: TPagination
      }
    });

    // Add default routes and router configuration
    if (options.router) {
      router(options);
      Vue.prototype.$routes = options.innerRoutes || [];
    }
  }
};

export default main;
export { __vue_component__$s as EditResource, __vue_component__$y as RouterView, SideNavMixin, __vue_component__$z as ViewResource, getProfile, logout };
