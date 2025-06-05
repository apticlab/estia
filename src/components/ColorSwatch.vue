<template>
  <div v-show="false">
    <div :key="color" v-for="color in colors">
      <span
        class="color-swatch"
        :class="'bg-' + color + '-' + step"
        v-for="step in steps"
        :key="step"
      >
      </span>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'

const colors = ref([
  'blue',
  'red',
  'gray',
  'orange',
  'indigo',
  'purple',
  'pink',
  'green',
  'teal'
])

const steps = ref(['100', '200', '300', '400', '500', '600', '700', '800', '900'])
</script>
