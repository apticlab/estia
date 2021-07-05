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
            'bg-blue': recursivity[day.index] == 1,
            'bg-white': recursivity[day.index] == 0
          }"
          class="w-5 h-5 border-2 border-blue cursor-pointer"
        ></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "resource-select",
  props: {
    context: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      weekDays: [
        {
          code: "monday",
          label: "L",
          index: 0
        },
        {
          code: "tuesday",
          label: "M",
          index: 1
        },
        {
          code: "wednesday",
          label: "M",
          index: 2
        },
        {
          code: "thursday",
          label: "G",
          index: 3
        },
        {
          code: "friday",
          label: "V",
          index: 4
        },
        {
          code: "saturday",
          label: "S",
          index: 5
        },
        {
          code: "sunday",
          label: "D",
          index: 6
        }
      ],
      recursivity: []
    };
  },
  mounted() {
    this.recursivity = [0, 0, 0, 0, 0, 0, 0];

    if (this.context.model) {
      console.log(this.context.model);
      this.recursivity = this.context.model.split(",");
    }
  },
  methods: {
    toggleWeekDay(day) {
      this.recursivity[day.index] = this.recursivity[day.index] == 1 ? 0 : 1;
      this.$forceUpdate();

      this.context.model = null;
      this.context.model = this.recursivity.join(",");
    }
  }
};
</script>
