<template>
  <div class="flex flex-row">
    <div
      :key="day.code"
      v-for="day in weekDays"
      class="flex-grow items-center flex cursor-pointer justify-center"
    >
      <div class="">
        <div
          :class="{
            'bg-blue-600 text-white border-blue-300': recursivity[day.index] == 1,
            'bg-gray-light text-gray-800 border-gray-200':
              recursivity[day.index] == 0
          }"
          class="w-5 h-5 border-2 cursor-pointer mr-1 rounded-full flex items-center justify-center text-sm"
        >
          {{ day.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  week: { type: String, required: true }
});

const weekDays = [
  { code: "monday", label: "L", index: 0 },
  { code: "tuesday", label: "M", index: 1 },
  { code: "wednesday", label: "M", index: 2 },
  { code: "thursday", label: "G", index: 3 },
  { code: "friday", label: "V", index: 4 },
  { code: "saturday", label: "S", index: 5 },
  { code: "sunday", label: "D", index: 6 }
];

const recursivity = ref([]);

const load = () => {
  recursivity.value = [0, 0, 0, 0, 0, 0, 0];

  if (props.week) {
    recursivity.value = props.week.split(",");
  }
};

watch(() => props.week, () => {
  load();
});

onMounted(() => {
  load();
});
</script>
