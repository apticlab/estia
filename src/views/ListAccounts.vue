<template>
  <div class="flex flex-col flex-grow">
    <transition name="slide-fade">
      <div class="py-3 w-full" v-if="!isLoading">
        <awesome-table
          :headers="headers"
          :actions="actions"
          :rows="accounts"
          @act="actOnRow"
        ></awesome-table>
      </div>
    </transition>
    <transition name="slide-fade">
      <loading v-if="isLoading" class="flex-grow w-full h-64"></loading>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { accounts as accountsConfig } from "@/services/headers";

const store = useStore();

const isLoading = ref(true);
const actions = accountsConfig.actions;
const headers = accountsConfig.headers;

const accounts = computed(() => store.state.users?.accounts);

const get_accounts = () => store.dispatch('users/get_accounts');

const actOnRow = (action, row) => {
  // Handle row action
};

onMounted(async () => {
  isLoading.value = true;
  await get_accounts();
  isLoading.value = false;
});
</script>
