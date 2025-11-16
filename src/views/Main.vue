<template>
  <div class="h-screen">
    <side-nav />
    <top-bar />
    <div
      class="bg-gray-100 relative pt-20 min-h-screen transition-all duration-200 ease-in flex flex-col"
      :class="is_collapsed ? 'pl-16 pr-2' : 'pl-56'"
    >
      <error-boundary
        class="max-w-screen-xl mx-auto px-4 pt-6 py-4 flex-grow w-full flex flex-col"
      >
        <router-view
          :key="$route.fullPath"
          class="max-w-screen-xl mx-auto px-4 pt-6 py-4 flex-grow w-full flex flex-col overflow-y-auto"
        />
      </error-boundary>
    </div>
    <color-swatch />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSideNav } from '@/composables/useSideNav';

const route = useRoute();
const { is_collapsed, listenForSideNavCollapseEvent } = useSideNav();

const path = ref([]);

const format_path_for_breadcrumbs = (routePath) => {
  const splitted_full_path = routePath
    .trim()
    .split('/')
    .map((item) => {
      return {
        disabled: false,
        exact: false,
        href: '/' + item,
        text: item,
        to: item
      };
    });

  path.value = splitted_full_path;
};

// Initialize
format_path_for_breadcrumbs(route.fullPath);
listenForSideNavCollapseEvent();

watch(() => route.fullPath, (newPath) => {
  format_path_for_breadcrumbs(newPath);
});
</script>
<style></style>
