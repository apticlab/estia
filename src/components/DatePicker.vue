<template>
  <div class="">
    <v-date-picker
      locale="it"
      :min-date="headers ? headers.minDate : attributes.minDate"
      :value="context.model"
      @input="updateDate"
      :popover="{ visibility: 'click' }"
    >
      <template v-slot="{ inputValue, inputEvents }">
        <input :value="inputValue" v-on="inputEvents" />
      </template>
    </v-date-picker>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue';

const props = defineProps({
  context: {
    type: Object,
    required: true,
  },
});

const instance = getCurrentInstance();
const moment = instance.appContext.config.globalProperties.$moment;

const attributes = computed(() => {
  return props.context.attributes;
});

const headers = computed(() => {
  return attributes.value.headers;
});

const formatDate = (newDate) => {
  return moment(newDate).format("YYYY-MM-DD");
};

const updateDate = ($event) => {
  props.context.model = formatDate($event);
};
</script>
