<template>
  <!-- <component v-if="iconComponent" v-bind="$attrs" :is="iconComponent" :weight="weight" /> -->
   <div class="size-10 bg-gray-300" />
</template>
<script setup>
import { computed, defineAsyncComponent, ref, markRaw, onMounted } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  weight: {
    type: String,
    default: 'regular',
    validator: (value) => ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'].includes(value),
  },
});

const componentCache = new Map();
const icon = ref(null);

const phosphorKey = computed(() => {
  const trimmed = props.name?.trim();
  return trimmed || null;
});

onMounted(() => {
  icon.value = iconComponent();
});

const iconComponent = function () {
  const key = phosphorKey.value;
  if (!key) {
    return null;
  }

  if (!componentCache.has(key)) {
    return '';
    /* componentCache.set(
      key,
      defineAsyncComponent(async () => {
        try {
          const module = await import('@phosphor-icons/vue');
          return markRaw(module[key]);
        } catch (error) {
          console.warn(`[Icon] Unable to load Phosphor icon "${key}".`, error);
          return null;
        }
      })
    ); */
  }

  return componentCache.get(key);
}
</script>
