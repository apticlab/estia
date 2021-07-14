<template>
  <div
    class="h-12 w-full fixed left-0 right-0 top-0 z-10 flex flex-row items-center justify-between duration-200 transition-all ease-in"
    :class="{ [shift]: true}"
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
          >{{ is_collapsed ? "Espandi" : "Chiudi" }}</span
        >
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
    </div>
  </div>
</template>

<script>
import { getProfile } from "@/utils/auth";
import SideNavMixin from "@/mixins/sidenav.mixin.js";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";

export default {
  name: "TopBar",
  props: {
    shift: { required: false, default: "sm:w-16", type: String },
  },
  mixins: [SideNavMixin],
  data: () => ({
    showUserMenu: false,
    userActions: [
      {
        label: "Logout",
        icon: "hi-lock-open",
        callback: "logout",
        roles: ["*"]
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
      console.log(action);
      this.showUserMenu = false;

      if (this[action.callback] != null) {
        this[action.callback]();
      }
    },
    logout() {
      this.$router.push("./logout");
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
    fullName() {
      return this.user.name + " " + this.user.surname;
    },
    actions() {
      return this.userActions.filter(action => {
        if (action.roles.includes("*")) {
          return true;
        }

        return action.roles.includes(this.getUserRole());
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
