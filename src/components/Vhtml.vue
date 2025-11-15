<template>
  <div v-html="value"></div>
</template>

<script setup>
defineProps({
  context: {
    type: Object,
    required: false,
  },
  value: {
    required: false,
  },
  resources: {
    required: false,
  },
  header: {
    required: false,
  },
});
</script>

<style>
</style>