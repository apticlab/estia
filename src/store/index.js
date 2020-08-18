import user from './user.store'

export default function (Vue, store) {
  store.registerModule('user', user)
}
