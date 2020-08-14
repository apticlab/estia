export default {
  data() {
    return {};
  },
  mounted() {},
  methods: {
    log(...logs) {
      console.log(`[${this.$options.name}]`, ...logs);
    },
  },
  computed: {},
};
