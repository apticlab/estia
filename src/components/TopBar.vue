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

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getProfile } from "@/utils/auth";
import { useSideNav } from "@/composables/useSideNav";

const props = defineProps({
  shift: { type: String, required: false, default: "sm:w-16" },
});

const router = useRouter();
const store = useStore();
const instance = getCurrentInstance();
const EventBus = instance.appContext.config.globalProperties.EventBus;

const { is_collapsed, show_text, collapseSideBar, listenForSideNavCollapseEvent } = useSideNav();

const showUserMenu = ref(false);
const userActions = ref([
  {
    label: "Logout",
    icon: "hi-lock-open",
    callback: "logout",
    roles: ["*"]
  }
]);

const user = computed(() => store.state.user?.user);
const updated_at = computed(() => store.state.page_info?.updated_at || store.state.page_info?.last_updated);
const post_num = computed(() => store.state.page_info?.post_num);
const story_num = computed(() => store.state.page_info?.story_num);
const reference_period = computed(() => store.getters['page_info/reference_period']);

const fullName = computed(() => {
  return user.value?.name + " " + user.value?.surname;
});

const actions = computed(() => {
  return userActions.value.filter(action => {
    if (action.roles.includes("*")) {
      return true;
    }
    return action.roles.includes(getUserRole());
  });
});

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const doUserAction = (action) => {
  showUserMenu.value = false;

  if (action.callback === 'logout') {
    logout();
  } else if (action.callback === 'logoutUser') {
    logoutUser();
  }
};

const logout = () => {
  router.push("./logout");
};

const logoutUser = () => {
  store.commit('user/remove_logged_account');
  router.push("/users");
};

const reloadUser = async () => {
  let userProfile = getProfile();
  await store.dispatch('user/set_user', userProfile);
};

const getUserRole = () => {
  return instance.appContext.config.globalProperties.getUserRole?.();
};

onMounted(() => {
  reloadUser();
  EventBus?.on("reload-user", reloadUser);
  listenForSideNavCollapseEvent();
});
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
