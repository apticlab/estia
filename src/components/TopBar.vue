<template>
  <div
    class="h-12 w-full bg-blue-dark sm:text-blue-dark sm:bg-white fixed left-0 right-0 top-0 z-10 flex flex-row items-center justify-between duration-200 transition-all ease-in"
    :class="is_collapsed ? 'pl-0 sm:pl-16' : 'pl-0 sm:pl-64'"
  >
    <div>
      <slot
        name="collapse"
        :is_collapsed="is_collapsed"
        :collapseSideBar="collapseSideBar"
      >
        <span
          class="ml-3 hover:underline cursor-pointer"
          @click="collapseSideBar()"
        >{{ is_collapsed ? "Espandi" : "Chiudi" }}</span>
      </slot>
    </div>
    <div class="block sm:hidden h-full flex flex-row items-center">
      <slot name="logo" />
    </div>
    <div class="flex flex-row">
      <div v-if="user">
        <slot
          name="userinfo"
          :user="user"
          :actions="actions"
          :doUserAction="doUserAction"
        />
      </div>
      <!--
      <div
        ref="popperTrigger"
        class="mr-1 sm:mr-4 flex flex-row items-center flex-initial"
      >
        <popper
          :toggler="showUserMenu"
          transition="slide-down-fade"
          trigger="toggler"
          :options="{
            position: 'bottom',
          }"
          @hide="showUserMenu = false"
        >
          <div
            slot="reference"
            class="p-2 flex flex-row items-center bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
            @click="toggleUserMenu()"
          >
            <div
              class="rounded-full h-8 w-8 bg-blue flex items-center justify-center"
            >
              <i class="ti-user text-gray-light text-lg" />
            </div>
          </div>
          <div
            class="popper shadow-lg bg-white rounded top-9 p-0 flex flex-col justify-start"
            style="min-width: 8rem"
          >
            <div
              v-if="user"
              class="w-full py-3 px-5 border-b border-blue-light flex flex-col text-blue text-lg items-start"
            >
              <span class="w-full text-left">Ciao, {{ user.full_name }}!</span>
              <span
                :style="'color: ' + user.role.color"
                class="rounded uppercase text-xs mt-2 font-bold"
              >{{ user.role.name }}</span>
            </div>
            <div
              v-for="action in actions"
              :key="action.name"
              class="w-64 cursor-pointer py-2 px-3 hover:bg-blue-light flex flex-row justify-start items-baseline hover:text-blue"
              @click="doUserAction(action)"
            >
              <i :class="action.icon" />
              <span class="ml-3">{{ action.label }}</span>
            </div>
          </div>
        </popper>
      </div>
        -->
    </div>
  </div>
</template>

<script>
import { getProfile } from '@/utils/auth'
import SideNavMixin from '@/mixins/sidenav.mixin.js'
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'

export default {
  name: 'TopBar',
  mixins: [SideNavMixin],
  data: () => ({
    showUserMenu: false,
    userActions: [
      {
        label: 'Logout',
        icon: 'hi-lock-open',
        callback: 'logout',
        roles: ['*']
      }
    ]
  }),
  beforeMount () {
    this.reloadUser()
    this.EventBus.$on('reload-user', this.reloadUser)
    this.listenForSideNavCollapseEvent()
  },
  methods: {
    ...mapActions('user', ['set_user', 'set_token']),
    toggleUserMenu () {
      this.showUserMenu = !this.showUserMenu
    },
    doUserAction (action) {
      console.log(action)
      this.showUserMenu = false

      if (this[action.callback] != null) {
        this[action.callback]()
      }
    },
    logout () {
      this.$router.push('./logout')
    },
    logoutUser () {
      this.remove_logged_account()
      this.$router.push('/users')
    },
    async reloadUser () {
      let user = getProfile()
      this.set_user(user)
    }
  },
  computed: {
    ...mapState('user', {
      user: state => state.user
    }),
    ...mapState('page_info', {
      updated_at: state => state.updated_at || state.last_updated,
      post_num: state => state.post_num,
      story_num: state => state.story_num
    }),
    ...mapGetters('page_info', ['reference_period']),
    routeSectionTitle () {
      this.lastUpdate = null

      let labels = this.$route.matched
        .map(route => (route.meta ? route.meta.label : null))
        .reverse()

      // Return the first not null && not undefined label
      return labels.find(label => !!label)
    },
    fullName () {
      return this.user.name + ' ' + this.user.surname
    },
    actions () {
      return this.userActions.filter(action => {
        if (action.roles.includes('*')) {
          return true
        }

        return action.roles.includes(this.user.role.code)
      })
    }
  }
}
</script>

<style>
.slide-fade-enter-active {
  transition: all 0.05s ease;
}
.slide-fade-leave-active {
  transition: all 0.05s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for <2.1.8 */ {
  transform: translateX(2px);
  opacity: 0;
}
</style>
