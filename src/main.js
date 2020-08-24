import VueFormulate from '@braid/vue-formulate'
import VueSVGIcon from 'vue-svgicon'
import VueTailwind from 'vue-tailwind'

import { helpers } from './utils/helpers'
import { EventBus } from './utils/event-bus.js'
import api from './utils/api'

import components from './components'
import mixins from './mixins'
import plugins from './plugins'
import filters from './filters'
import resources from './resources'
import router from './router'
import store from './store'

export default {
  install (Vue, options) {
    components(Vue)
    mixins(Vue)
    plugins(Vue)
    filters(Vue)
    resources(Vue, options.resources || {})
    store(Vue, options.store)

    Object.keys(helpers).forEach(key => (Vue.prototype[key] = helpers[key]))

    Vue.prototype.$api = api(options)
    Vue.prototype.EventBus = EventBus

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
