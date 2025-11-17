<template>
  <div class="rounded-full overflow-hidden w-full bg-blue-600-400">
    <div class="bg-green-400 py-2" :style="{ width: innerWidth + '%' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';

const props = defineProps({
  values: { type: Object, required: true },
  elem: { type: Object, required: true }
});

const instance = getCurrentInstance();
const deepPick = instance.appContext.config.globalProperties.deepPick;

const innerWidth = ref(0);

onMounted(() => {
  let first_value = deepPick(props.elem, props.values.first.field);
  let second_value = deepPick(props.elem, props.values.second.field);

  innerWidth.value = 100 - (second_value / (first_value + second_value)) * 100;
});
</script>
