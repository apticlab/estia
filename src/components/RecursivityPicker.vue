<template>
  <div :data-type="context.type" class="flex flex-row form-control">
    <div
      :key="day.code"
      v-for="day in weekDays"
      class="flex-grow items-center flex cursor-pointer justify-center"
      @click="toggleWeekDay(day)"
    >
      <label :for="day.code" class="mr-2 cursor-pointer">{{ day.label }}</label>
      <div class="">
        <div
          :class="{
            'bg-blue-600': recursivity[day.index] == 1,
            'bg-white': recursivity[day.index] == 0
          }"
          class="w-5 h-5 border-2 border-blue-300 cursor-pointer"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  context: {
    type: Object,
    required: true
  }
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

const toggleWeekDay = (day) => {
  recursivity.value[day.index] = recursivity.value[day.index] == 1 ? 0 : 1;

  props.context.model = null;
  props.context.model = recursivity.value.join(",");
};

onMounted(() => {
  recursivity.value = [0, 0, 0, 0, 0, 0, 0];

  if (props.context.model) {
    recursivity.value = props.context.model.split(",");
  }
});
</script>
