<template>
  <div>
    <div :class="$theme.tab_view.container">
      <div v-if="currentTab" :class="$theme.tab_view.tab_container">
        <div
          v-for="tab in visibleTabs"
          :class="{
            [$theme.tab_view.active]: currentTab.code == tab.code,
            [$theme.tab_view.inactive]: currentTab.code !== tab.code,
            [$theme.tab_view.normal]: true
          }"
          :key="tab.label"
          @click="goToTab(tab, true)"
          class=""
        >
          <i v-if="tab.icon" class="mr-1 text-xs fas" :class="tab.icon"></i>
          {{ tab.label }}
        </div>
      </div>
    </div>
    <router-view v-if='tabsFromRouter'></router-view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const props = defineProps({
  initialTabIndex: { type: Number, required: false, default: null },
  externalTabs: { type: Array, required: false }
});

const emit = defineEmits(['tab-change']);

const route = useRoute();
const router = useRouter();
const store = useStore();
const instance = getCurrentInstance();

const basePath = ref("");
const currentResource = ref(null);
const tabs = ref(null);
const tabsFromRouter = ref(false);
const currentTab = ref(null);

const user = computed(() => store.state.user?.user);

const visibleTabs = computed(() => {
  if (!tabs.value) return [];
  
  return tabs.value.filter(tab => {
    if (!tab.roles) {
      return true;
    }

    return tab.roles.includes(getUserRole());
  });
});

const getUserRole = () => {
  return instance?.appContext.config.globalProperties.getUserRole?.();
};

const fetchTabs = () => {
  if (props.externalTabs) {
    tabs.value = props.externalTabs;
    return;
  }

  tabsFromRouter.value = true;

  let routeWithTabDefinition = route.matched.find(r =>
    r.meta ? r.meta.tabs : null
  );

  basePath.value = routeWithTabDefinition.path;
  tabs.value = routeWithTabDefinition.meta.tabs || [];
};

const goToTab = (tab, fromTapAction = false) => {
  if (!tab) {
    return;
  }

  currentTab.value = tab;

  // Don't go to this tab if we're already there
  if (currentResource.value && currentResource.value == tab.code) {
    return;
  }

  if (tabsFromRouter.value) {
    router.push({
      path: `${basePath.value}/${tab.code}/list`
    });
  }

  if (fromTapAction) {
    emit("tab-change", tab);
  }
};

// Initialize
fetchTabs();

onMounted(() => {
  if (tabsFromRouter.value && route.params.resource) {
    currentResource.value = route.params.resource;
    goToTab(tabs.value.find(tab => tab.code == currentResource.value));
    return;
  }

  if (!props.initialTabIndex) {
    goToTab(visibleTabs.value[0]);
    return;
  }

  goToTab(visibleTabs.value[props.initialTabIndex]);
});
</script>

<style></style>
