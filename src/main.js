import VueFormulate from '@braid/vue-formulate'
import VueSVGIcon from 'vue-svgicon'
import VueTailwind from 'vue-tailwind'

import { helpers } from './utils/helpers'
import { EventBus } from './utils/event-bus.js'
import api from './utils/api'
import { getProfile } from './utils/auth';

import theme from './theme';
import mixins from './mixins'
import plugins from './plugins'
import filters from './filters'
import resources from './resources'
import router from './router'
import store from './store'
import viewFields from './view-fields'
import components, {
  RouterView,
  EditResource
} from './components'
import {
  SideNav as SideNavMixin
} from './mixins';

export default {
  install (Vue, options) {
    Vue.prototype.$api = api(options)
    Vue.prototype.EventBus = EventBus
    Vue.prototype.$theme = theme(options)

    components(Vue)
    mixins(Vue)
    plugins(Vue)
    filters(Vue)
    resources(Vue, options.resources || {})
    store(Vue, options.store)
    viewFields(Vue, options.viewFields)

    Object.keys(helpers).forEach(key => (Vue.prototype[key] = helpers[key]))

    Vue.use(VueFormulate, {
      library: {
        'resource-select': {
          component: 'resource-select'
        },
        resource: {
          component: 'resource-editor'
        },
        'recursivity-picker': {
          component: 'recursivity-picker'
        },
        json: {
          component: 'resource-json'
        },
        'image-uploader': {
          component: 'resource-image-uploader'
        }
      }
    })

    Vue.use(VueSVGIcon)
    Vue.use(VueTailwind)

    // Add default routes and router configuration
    if (options.router) {
      router(options)
      Vue.prototype.$routes = options.innerRoutes || []
    }
  }
}

export {
  RouterView,
  EditResource,
  SideNavMixin,
  getProfile
}
