<template>
  <div class="h-screen">
    <side-nav class="w-64">
      <template v-slot:logo="{ is_collapsed }">
        LOGO
      </template>
      <template v-slot:nav-item="{ item, selected, is_collapsed }">
        <div
          :class="{
            'bg-orange-300': selected,
          }"
          class="flex flex-row py-4 px-2 cursor-pointer"
        >
          <div
            v-if="!is_collapsed"
            :class="{
              'text-orange-700': selected,
            }"
            class="uppercase"
          >
            {{ item.meta.label }}
          </div>
        </div>
      </template>
    </side-nav>
    <top-bar class="h-16">
      <template v-slot:userinfo="{ user, actions, doUserAction }">
        <div class="text-black mr-5">Ciao, {{ user.full_name }}!</div>
        <div
          :key="index"
          v-for="(action, index) in actions"
          @click="doUserAction(action)"
          class="text-blue-600 hover:underline cursor-pointer"
        >
          {{ action.label }}
        </div>
      </template>
    </top-bar>
    <div
      class="bg-gray-100 relative pt-16 min-h-screen transition-all duration-200 ease-in flex flex-col"
      :class="is_collapsed ? 'pl-16 pr-2' : 'pl-64'"
    >
      <router-view
        class="max-w-screen-xl mx-auto px-4 pt-6 py-4 flex-grow w-full flex flex-col overflow-y-auto"
      ></router-view>
    </div>
    <color-swatch />
  </div>
</template>
<script>
import { mapMutations } from 'vuex';
import SideNavMixin from '../../node_modules/@apticlab/estia/src/mixins/sidenav.mixin.js';

export default {
  name: 'Main',
  mixins: [SideNavMixin],
  mounted() {
    this.set_user({
      full_name: 'Prova',
      role: {
        name: 'Prova',
        color: 'red',
        code: 'test',
      },
    });
  },
  methods: {
    ...mapMutations('user', ['set_user']),
  },
};
</script>
