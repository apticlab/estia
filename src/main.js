import VueFormulate from "@braid/vue-formulate";
import VueTailwind from "vue-tailwind";
import TPagination from "vue-tailwind/dist/t-pagination";
import moment from "moment";

import { helpers } from "./utils/helpers";
import { EventBus } from "./utils/event-bus.js";
import api from "./utils/api";
import { getProfile, logout } from "./utils/auth";

import theme from "./theme";
import mixins from "./mixins";
import plugins from "./plugins";
import filters from "./filters";
import resources from "./resources";
import router from "./router";
import store from "./store";
import viewFields from "./view-fields";
import editFields from "./edit-fields";
import modalWidgets from "./modal-widgets";
import components, {
  RouterView,
  ViewResource,
  EditResource
} from "./components";
import { SideNav as SideNavMixin } from "./mixins";
import Validators from "./validators";

export default {
  install(Vue, options) {
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
    filters(Vue, options.filters || {});
    resources(Vue, options.resources || {});
    store(Vue, options.store);
    viewFields(Vue, options);
    editFields(Vue, options);
    modalWidgets(Vue, options);

    Object.keys(helpers).forEach(key => (Vue.prototype[key] = helpers[key]));

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

export {
  RouterView,
  EditResource,
  ViewResource,
  SideNavMixin,
  getProfile,
  logout
};
