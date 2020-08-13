import { VLazyImagePlugin } from "v-lazy-image";
import Dialog from "./plugins/dialog.js";
import Alert from "./plugins/alert.js";
import VueFormulate from "@braid/vue-formulate";
import Logger from "./mixin/logger.mixin";
import MobileMix from "./mixin/mobile.mixin";
import VCalendar from "v-calendar";
import VueWindowSize from "vue-window-size";
import { helpers } from "./utils/helpers";
import { EventBus } from "./utils/event-bus.js";
import { api } from "./utils/api";
import filters from "./utils/filters";
import routes from "./utils/routes";
import components from "./utils/components";

import "./assets/css/app.css";

export default {
  install(Vue, options) {
    components(Vue);
    Object.keys(filters).forEach(key => Vue.filter(key, filters[key]));
    Object.keys(helpers).forEach(key => (Vue.prototype[key] = helpers[key]));

    Vue.prototype.$api = api;
    Vue.prototype.EventBus = EventBus;

    Vue.use(VCalendar);
    Vue.use(Dialog);
    Vue.use(Alert);
    Vue.use(VLazyImagePlugin);
    Vue.use(VueWindowSize);
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
        }
      }
    });

    Vue.mixin(Logger);
    Vue.mixin(MobileMix);

    // Add default routes and router configuration
    if (options.router) {
      options.router.addRoutes(routes);
    }
  }
};
