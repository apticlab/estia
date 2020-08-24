import { EventBus } from '@/utils/event-bus.js'

export default {
  namespaced: true,
  state: {
    user: null,
    token: null
  },
  mutations: {
    set_user (state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    set_token (state, token) {
      localStorage.setItem('token', token)
      state.token = token
      // EventBus.$emit('token-changed');
    },
    remove_logged_account (state) {
      state.user.account = null
      localStorage.setItem('user', JSON.stringify(state.user))
    }
  },
  actions: {
    async set_user ({ commit }, user) {
      commit('set_user', user)
    },
    async change_active_account ({ commit }, account_id) {
      console.log('change_active_account')
      try {
        let response = await this.$api.post('change-account', { 'account_id': account_id })
        commit('set_token', response.token)
        commit('set_user', response.user)
        return true
      } catch (e) {
        return false
      }
    }
  },
  getters: {
    accounts: state => {
      let accounts = state.user.accounts.map((account) => {
        account['id'] = account['pk']
        return account
      })
      return accounts
    }
  }
}
