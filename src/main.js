import VueFormulate from '@braid/vue-formulate'

import { helpers } from './utils/helpers'
import { EventBus } from './utils/event-bus.js'
import { api } from './utils/api'

import components from './components'
import mixins from './mixins'
import plugins from './plugins'
import filters from './filters'
import router from './router'

import './assets/css/app.css'

export default {
  install (Vue, options) {
    components(Vue)
    mixins(Vue)
    plugins(Vue)
    filters(Vue)

    Object.keys(helpers).forEach(key => (Vue.prototype[key] = helpers[key]))

    Vue.prototype.$api = api
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

    // Add default routes and router configuration
    if (options.router) {
      router(options)
    }
  }
}
