<template>
  <div class="rounded-full overflow-hidden w-full bg-blue-400">
    <div class="bg-green-400 py-2" :style="{ width: innerWidth + '%' }"></div>
  </div>
</template>
<script>
export default {
  props: {
    values: {},
    elem: {}
  },
  data() {
    return {
      innerWidth: 0
    };
  },
  mounted() {
    let first_value = this.deepPick(this.elem, this.values.first.field);
    let second_value = this.deepPick(this.elem, this.values.second.field);

    this.innerWidth = 100 - (second_value / (first_value + second_value)) * 100;
  }
};
</script>
