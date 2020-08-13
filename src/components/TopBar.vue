<template>
  <div
    class="h-12 w-full bg-blue-dark text-white sm:text-blue-dark sm:bg-white fixed left-0 right-0 top-0 z-10 flex flex-row items-center justify-between duration-200 transition-all ease-in"
    :class="is_collapsed ? 'pl-0 sm:pl-16' : 'pl-0 sm:pl-64'"
  >
    <!-- <transition name="slide-fade" mode="out-in">
      <div
        :key="routeSectionTitle"
        class="ml-8 mr-auto text-2xl text-green-600 font-medium select-none flex flex-col"
      >
        <span>{{ routeSectionTitle }}</span>
      </div>
    </transition>-->
    <div
      class="hover:bg-gray-200 pl-4 text-sm flex flex-row items-center justify-center cursor-pointer hover:text-gray-700 highlights-none"
      @click="collapseSideBar()"
    >
      <div v-if="!is_mobile" class="flex flex-row select-none">
        <div
          class="flex flex-row items-center text-base w-full"
          :class="is_collapsed ? 'justify-center' : ''"
        >
          <span
            class="ti-menu text-blue"
            :class="is_collapsed ? 'rotate-0-cw' : 'rotate-180-cw'"
          ></span>
        </div>
      </div>
      <div class="flex flex-row select-none" v-else>
        <div
          class="flex flex-row items-center text-base w-full"
          :class="is_collapsed ? 'justify-center' : ''"
        >
          <span class :class="is_collapsed ? 'ti-menu' : 'ti-close'"></span>
        </div>
      </div>
    </div>
    <div class="block sm:hidden h-full flex flex-row items-center">
      <div
        class="bg-contain bg-center bg-no-repeat w-32 ml-10 h-full"
        :style="{
          'background-image': 'url(\'/img/security_logo@2x.png\')'
        }"
      ></div>
    </div>
    <div class="flex flex-row">
      <div
        class="ml-0 sm:ml-auto py-1 px-3 cursor-pointer flex flex-row items-center flex-initial"
      >
        <i class="ti-bell text-gray-600 text-2xl"></i>
      </div>
      <div
        class="mr-1 sm:mr-4 flex flex-row items-center flex-initial"
        ref="popperTrigger"
      >
        <popper
          :toggler="showUserMenu"
          transition="slide-down-fade"
          trigger="toggler"
          :options="{
            position: 'bottom'
          }"
          v-on:hide="showUserMenu = false"
        >
          <div
            slot="reference"
            @click="toggleUserMenu()"
            class="p-2 flex flex-row items-center bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
          >
            <!-- <div class="flex flex-col items-center text-gray-700 mr-3">
              <i class="zi-cheveron-up" />
              <i class="zi-cheveron-down" />
            </div>
            <div class="flex flex-row items-center">
              <avatar :user="user" class="w-8 h-8 mr-5"></avatar>
              <div class="flex flex-col items-start">
                <small class="text-gray-600">{{ fullName }}</small>
                <span class="text-xs text-gray-500">{{
                  user.role.name | uppercase
                  }}</span>
              </div>
            </div>-->
            <div
              class="rounded-full h-8 w-8 bg-blue flex items-center justify-center"
            >
              <i class="ti-user text-gray-light text-lg"></i>
            </div>
          </div>
          <div
            class="popper shadow-lg bg-white rounded top-9 p-0 flex flex-col justify-start"
            style="min-width: 8rem"
          >
            <div
              class="w-full py-3 px-5 border-b border-blue-light flex flex-col text-blue text-lg items-start"
            >
              <span class="w-full text-left">Ciao, {{ user.full_name }}!</span>
              <span
                :style="'color: ' + user.role.color"
                class="rounded uppercase text-xs mt-2 font-bold"
                >{{ user.role.name }}</span
              >
            </div>
            <div
              class="w-64 cursor-pointer py-2 px-3 hover:bg-blue-light flex flex-row justify-start items-baseline hover:text-blue"
              @click="doUserAction(action)"
              :key="action.name"
              v-for="action in actions"
            >
              <i :class="action.icon"></i>
              <span class="ml-3">{{ action.label }}</span>
            </div>
          </div>
        </popper>
      </div>
    </div>
  </div>
</template>

<script>
import { getProfile } from "@/utils/auth";
import Popper from "@/components/Popper";
import SideNavMixin from "@/mixin/SideNav.mixin.js";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";

export default {
  name: "top-bar",
  mixins: [SideNavMixin],
  components: {
    popper: Popper
  },
  data: () => ({
    showUserMenu: false,
    userActions: [
      {
        label: "Logout",
        icon: "hi-lock-open",
        callback: "logout",
        roles: [
          "superadmin",
          "user_provider",
          "company_manager",
          "site_manager",
          "officer"
        ]
      }
    ]
  }),
  beforeMount() {
    this.reloadUser();
    this.EventBus.$on("reload-user", this.reloadUser);
    this.listenForSideNavCollapseEvent();
  },
  methods: {
    ...mapActions("user", ["set_user", "set_token"]),
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    doUserAction(action) {
      this.showUserMenu = false;

      if (this[action.callback] != null) {
        this[action.callback]();
      }
    },
    logout() {
      this.$router.push({ name: "logout" });
    },
    logoutUser() {
      this.remove_logged_account();
      this.$router.push("/users");
    },
    async reloadUser() {
      let user = getProfile();
      this.set_user(user);
    }
  },
  computed: {
    ...mapState("user", {
      user: state => state.user
    }),
    ...mapState("page_info", {
      updated_at: state => state.updated_at || state.last_updated,
      post_num: state => state.post_num,
      story_num: state => state.story_num
    }),
    ...mapGetters("page_info", ["reference_period"]),
    routeSectionTitle() {
      this.lastUpdate = null;

      let labels = this.$route.matched
        .map(route => (route.meta ? route.meta.label : null))
        .reverse();

      // Return the first not null && not undefined label
      return labels.find(label => !!label);
    },
    fullName() {
      return this.user.name + " " + this.user.surname;
    },
    actions() {
      return this.userActions.filter(action => {
        return action.roles.includes(this.user.role.code);
      });
    }
  }
};
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
