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
  install(app, options) {
    $api = api(options);
    app.config.globalProperties.$api = $api;
    app.config.globalProperties.$bus = EventBus;
    app.config.globalProperties.$theme = theme(options);
    app.config.globalProperties.$actions = options.actions ? options.actions : {};
    app.config.globalProperties.$moment = moment;
    app.config.globalProperties.$roleLookup = options.roleLookup;
    app.config.globalProperties.$icon = options.icon || "heroicons";
    app.config.globalProperties.$validators = _.merge(Validators, options.validators);

    components(app);
    mixins(app);
    plugins(app);
    filters(app, options.filters || {});
    resources(app, options.resources || {});
    store(app, options.store);
    viewFields(app, options);
    editFields(app, options);
    modalWidgets(app, options);

    Object.keys(_.merge(helpers, (options.helpers || {}))).forEach(key => (app.config.globalProperties[key] = helpers[key]));

    app.use(VueFormulate, {
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
      app.config.globalProperties.$routes = options.innerRoutes || [];
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
