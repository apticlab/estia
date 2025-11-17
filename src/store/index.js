import user from './user.store'

export default function (app, store) {
  store.registerModule('user', user)
}
