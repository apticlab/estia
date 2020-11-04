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
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "tab-view",
  props: {
    initialTabIndex: { required: false, default: null },
    externalTabs: { required: false }
  },
  data() {
    return {
      basePath: "",
      currentResource: null,
      tabs: null,
      tabsFromRouter: false,
      currentTab: null
    };
  },
  beforeMount() {
    this.fetchTabs();
  },
  mounted() {
    if (this.tabsFromRouter && this.$route.params.resource) {
      this.currentResource = this.$route.params.resource;
      this.goToTab(this.tabs.find(tab => tab.code == this.currentResource));
      return;
    }

    if (!this.initialTabIndex) {
      this.goToTab(this.visibleTabs[0]);
      return;
    }

    this.goToTab(this.visibleTabs[this.initialTabIndex]);
  },
  methods: {
    fetchTabs() {
      if (this.externalTabs) {
        this.tabs = this.externalTabs;
        return;
      }

      this.tabsFromRouter = true;

      let routeWithTabDefinition = this.$route.matched.find(route =>
        route.meta ? route.meta.tabs : null
      );

      this.basePath = routeWithTabDefinition.path;
      this.tabs = routeWithTabDefinition.meta.tabs || [];
    },
    goToTab(tab, fromTapAction = false) {
      if (!tab) {
        return;
      }

      this.currentTab = tab;

      // Don't go to this tab if we're already there
      if (this.currentResource && this.currentResource == tab.code) {
        return;
      }

      if (this.tabsFromRouter) {
        this.$router.push({
          path: `${this.basePath}/${tab.code}/list`
        });
      }

      if (fromTapAction) {
        this.$emit("tab-change", tab);
      }
    }
  },
  computed: {
    ...mapState("user", {
      user: state => state.user
    }),
    visibleTabs() {
      return this.tabs.filter(tab => {
        if (!tab.roles) {
          return true;
        }

        return tab.roles.includes(this.$roleLookupthis.user.role.code);
      });
    }
  },
  watch: {}
};
</script>

<style></style>
