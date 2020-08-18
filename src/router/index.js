import axios from 'axios'

import {
  isLoggedIn,
  isUserActive,
  isUserEnabled,
  getProfile
} from '@/utils/auth'

import Login from '@/components/Login.vue'
import Logout from '@/components/Logout.vue'

const noAuthRouteList = [
  'password_reset',
  'welcome'
]

export default function (options) {
  let router = options.router

  // Is Authenticated
  router.beforeEach((to, from, next) => {
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

    if (noAuthRouteList.indexOf(to.name) == -1) {
      if (to.matched.some(record => record.meta.requiresAuth)) {
        var redirectPath = to.path.split('/')[1]

        if (!isLoggedIn()) {
          router.push('/login?redirect=' + redirectPath)
          next(false)
        } else {
          next()
        }
      } else {
        next()
      }
    } else {
      next()
    }
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

        if (user.role.code == 'superadmin' && user.account) {
          userRole = 'user'
        }

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

  let loginComponent = options.baseComponents ? options.baseComponents.login : Login

  console.log(options)

  console.log(loginComponent)

  let routes = [
    {
      path: '/login',
      name: 'login',
      component: loginComponent,
      meta: {
        requiresAuth: false
      }
    },
    {
      name: 'logout',
      path: '/logout',
      component: Logout
    }
  ]

  router.addRoutes(routes)

  axios.interceptors.response.use(undefined, function (err) {
    if (err.response.status == 401) {
      router.push('/login')
      return Promise.reject(err)
    }

    return Promise.reject(err)
  })
}
