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
<script>
export default {
  name: "DatePicker",
  props: {
    context: {
      type: Object,
      required: true,
    },
  },
  mounted() {},
  data() {
    return {};
  },
  methods: {
    updateDate($event) {
      this.context.model = this.formatDate($event);
    },
    formatDate(newDate) {
      return this.moment(newDate).format("YYYY-MM-DD");
    },
  },
  computed: {
    attributes() {
      return this.context.attributes;
    },
    headers() {
      return this.attributes.headers;
    },
  },
};
</script>
