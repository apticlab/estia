<template>
  <div>
    <div class="bg-white px-4">
      <div
        v-if="current_tab"
        class="flex flex-row justify-between sm:justify-start mx-auto px-0 sm:px-4 sm:max-w-screen-sm md:max-w-screen-md xl:max-w-screen-xl"
      >
        <div
          v-for="tab in visibleTabs"
          :class="{
            'text-blue-dark border-b-2 border-blue':
              current_tab.code == tab.code
          }"
          :key="tab.label"
          @click="goToTab(tab, true)"
          class="mr-8 py-3 text-lg font-bold text-gray-light section-link cursor-pointer"
        >
          <i v-if="tab.icon" class="fas mr-1 text-xs" :class="tab.icon"></i>
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
    initial_tab: { required: false, default: null },
    external_tabs: { required: false }
  },
  data() {
    return {
      basePath: "",
      resource_name: null,
      current_resource: null,
      tabs: null,
      tabsFromRouter: false,
      current_tab: null
    };
  },
  beforeMount() {
    this.fetchTabs();
  },
  mounted() {
    if (this.tabsFromRouter && this.$route.params.resource) {
      this.current_resource = this.$route.params.resource;
      this.goToTab(this.tabs.find(tab => tab.code == this.current_resource));
      return;
    }

    if (!this.initial_tab) {
      this.goToTab(this.visibleTabs[0]);
      return;
    }

    this.goToTab(this.visibleTabs[this.initial_tab]);
  },
  methods: {
    fetchTabs() {
      if (this.external_tabs) {
        this.tabs = this.external_tabs;
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

      this.current_tab = tab;

      // Don't go to this tab if we're already there
      if (this.current_resource && this.current_resource == tab.code) {
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

        return tab.roles.includes(this.user.role.code);
      });
    }
  },
  watch: {}
};
</script>

<style></style>
