import VueFormulate from "@braid/vue-formulate";
import moment from "moment";

// Import styles
import style from "./style.css";
import timepickerstyle from "vue2-timepicker/dist/VueTimepicker.css";

import { helpers } from "./utils/helpers.js";
import { EventBus } from "./utils/event-bus.js";
import api from "./utils/api.js";
import { getProfile, logout } from "./utils/auth.js";
import theme from "./theme/index.js";
import mixins from "./mixins/index.js";
import plugins from "./plugins/index.js";
import filters from "./filters/index.js";
import resources from "./resources/index.js";
import router from "./router/index.js";
import store from "./store/index.js";
import viewFields from "./view-fields/index.js";
import editFields from "./edit-fields/index.js";
import modalWidgets from "./modal-widgets/index.js";
import components, {
  RouterView,
  ViewResource,
  EditResource
} from "./components/index.js";
import { SideNav as SideNavMixin } from "./mixins/index.js";
import Validators from "./validators/index.js";
import _ from 'lodash';

let $api = null;

export default {
  install(Vue, options) {
    $api = api(options);
    Vue.prototype.$api = $api;
    Vue.prototype.EventBus = EventBus;
    Vue.prototype.$theme = theme(options);
    Vue.prototype.$actions = options.actions ? options.actions : {};
    Vue.prototype.$moment = moment;
    Vue.prototype.$roleLookup = options.roleLookup;
    Vue.prototype.$icon = options.icon || "heroicons";
    Vue.prototype.$validators = _.merge(Validators, options.validators);

    components(Vue);
    mixins(Vue);
    plugins(Vue);
    filters(Vue, options.filters || {});
    resources(Vue, options.resources || {});
    store(Vue, options.store);
    viewFields(Vue, options);
    editFields(Vue, options);
    modalWidgets(Vue, options);

    Object.keys(_.merge(helpers, (options.helpers || {}))).forEach(key => (Vue.prototype[key] = helpers[key]));

    Vue.use(VueFormulate, {
      library: {
        "v-html": {
          component: 'v-html'
        },
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

    // Add default routes and router configuration
    if (options.router) {
      router(options);
      Vue.prototype.$routes = options.innerRoutes || [];
    }
  }
};

export {
  RouterView,
  EditResource,
  ViewResource,
  SideNavMixin,
  getProfile,
  logout,
  $api,
  EventBus as $bus
};
