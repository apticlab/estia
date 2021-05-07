export default {
  data() {
    return {};
  },
  mounted() { },
  methods: {
    log(...logs) {
      if (process.env.NODE_ENV != 'production') {
        console.log(`[${this.$options.name}]`, ...logs);
      }
    },
  },
  computed: {},
};
