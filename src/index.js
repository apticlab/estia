import { plugin as FormKitPlugin, defaultConfig } from '@formkit/vue';
import moment from "moment";

// Import styles
import style from "./style.css";

import { helpers } from "./utils/helpers.js";
import { EventBus } from "./utils/event-bus.js";
import api from "./utils/api.js";
import { getProfile, logout } from "./utils/auth.js";
import theme from "./theme/index.js";
import { ThemeSymbol } from "./composables/useTheme.js";
import mixins from "./mixins/index.js";
import plugins from "./plugins/index.js";
import filters from "./filters/index.js";
import resources from "./resources/index.js";
import router from "./router/index.js";
import store from "./store/index.js";
import i18n from "./i18n/index.js";

import viewFields from "./view-fields/index.js";
import editFields from "./edit-fields/index.js";
import modalWidgets from "./modal-widgets/index.js";
import components, {
  RouterView,
  ViewResource,
  EditResource
} from "./components/index.js";
import Icon from "./components/Icon.vue";
import { SideNav as SideNavMixin } from "./mixins/index.js";
import Validators from "./validators/index.js";
import _ from 'lodash';

let $api = null;

export default {
  install(app, options) {
    $api = api(options);
    app.config.globalProperties.$api = $api;
    app.config.globalProperties.EventBus = EventBus;

    const themeConfig = theme(options);
    app.config.globalProperties.$theme = themeConfig;
    app.provide(ThemeSymbol, themeConfig);
    
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

    // Use FormKit as replacement for VueFormulate
    app.use(FormKitPlugin, defaultConfig({
      inputs: {
        "v-html": {
          type: 'input',
          component: 'v-html'
        },
        "resource-select": {
          type: 'input',
          component: "resource-select"
        },
        resource: {
          type: 'input',
          component: "resource-editor"
        },
        "recursivity-picker": {
          type: 'input',
          component: "recursivity-picker"
        },
        json: {
          type: 'input',
          component: "resource-json"
        },
        "image-uploader": {
          type: 'input',
          component: "resource-image-uploader"
        },
        date: {
          type: 'input',
          component: "date-picker"
        }
      }
    }));

    app.use(i18n);

    // Add default routes and router configuration
    if (options.router) {
      router(options);
      app.config.globalProperties.$routes = options.innerRoutes || [];
    }
  }
};

export {
  Icon,
  RouterView,
  EditResource,
  ViewResource,
  SideNavMixin,
  getProfile,
  logout,
  $api,
  EventBus as $bus
};
