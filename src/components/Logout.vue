<template>
  <div />
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { logout } from '../utils/auth';

const router = useRouter();

onMounted(() => {
  logout();
  router.push('/login');
});
</script>
