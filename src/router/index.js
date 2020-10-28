import axios from 'axios'

import {
  isLoggedIn,
  getProfile
} from '@/utils/auth'

import Login from '@/components/Login.vue'
import Logout from '@/components/Logout.vue'
import Main from '@/views/Main.vue'

const defaultNoAuthRouteList = [
]

export default function (options) {
  let router = options.router
  let noAuthRouteList = options.noAuthRouteList ? options.noAuthRouteList : defaultNoAuthRouteList

  // Is Authenticated
  router.beforeEach((to, from, next) => {
    if (noAuthRouteList.includes(to.name)) {
      next()
      return
    }

    let authUser = getProfile()
    let routeRequiresAuth = to.matched.some(route => {
      return route.meta && route.meta.requiresAuth
    })

    if (!routeRequiresAuth) {
      next()
      return
    }

    if (!authUser) {
      router.push('/login')
      return
    }

    if (to.matched.some(record => record.meta.requiresAuth)) {
      var redirectPath = to.path.split('/')[1]

      if (!isLoggedIn()) {
        router.push('/login?redirect=' + redirectPath)
        next(false)
        return
      }
    }

    next()
  })

  // Role based auth
  router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.roles)) {
      var user = getProfile()

      if (!user) {
        router.push('/login')
        next(false)
      }

      var roleHolder = null

      // Get the last route role guard
      for (var index in to.matched) {
        var path = to.matched[index]

        if (path.meta && path.meta.roles) {
          roleHolder = path.meta.roles
        }
      }

      if (roleHolder != null && user != null) {
        let userRole = user.role.code.toLowerCase()
        let userHasRole = roleHolder.indexOf(userRole) != -1

        if (userHasRole) {
          next()
        } else {
          router.push('/login')
          next(false)
        }
      } else {
      // If no roles are provided, simply let the user in
        next()
      }
    } else {
      next()
    }
  })

  let innerRoutes = options.innerRoutes || []
  let outerRoutes = options.outerRoutes || []

  let baseComponents = {
    login: Login,
    main: Main,
    ...options.baseComponents
  }

  let routes = [
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
      component: Logout
    },
    {
      path: '/',
      name: 'main',
      component: baseComponents.main,
      meta: {
        requiresAuth: true
      },
      children: innerRoutes
    },
    ...outerRoutes
  ]

  router.addRoutes(routes)

  axios.interceptors.response.use(undefined, function (err) {
    if (err.response.status === 401) {
      router.push('/login')
      return Promise.reject(err)
    }

    return Promise.reject(err)
  })
}
