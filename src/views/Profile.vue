<template>
  <div class="px-4 py-3">
    <div v-if="userToShow.isActive">
      <user-detail :user="userToShow"></user-detail>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProfile } from "../utils/auth.js";

const error = ref(null);
const isLoading = ref(true);
const userToShow = ref({});
const state = ref(null);

onMounted(async () => {
  isLoading.value = true;

  state.value = "first_login";
  userToShow.value = getProfile();

  isLoading.value = false;
});
</script>
