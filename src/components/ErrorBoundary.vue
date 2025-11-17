<template>
  <div>
    <slot v-if="err" name="error" v-bind:err="err">
      <page-error :error="errorStatus"></page-error>
    </slot>
    <slot v-else></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, watch, onErrorCaptured } from 'vue';
import { useRoute } from 'vue-router';

defineProps({
  stopPropagation: Boolean,
});

const route = useRoute();
const instance = getCurrentInstance();
const EventBus = instance?.appContext.config.globalProperties.EventBus;

const errorStatus = ref(null);
const err = ref(false);

const resetError = () => {
  err.value = null;
};

const reloadError = (error) => {
  err.value = error;

  if (error.response) {
    errorStatus.value = error.response.status || 500;
  } else {
    errorStatus.value = 500;
  }
};

onMounted(() => {
  EventBus?.on("err-boundary", (error) => {
    reloadError(error);
  });
});

onErrorCaptured((error) => {
  reloadError(error);
  return true;
});

watch(() => route, () => {
  err.value = null;
});
</script>
