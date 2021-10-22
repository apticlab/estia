export default {
  data() {
    return {};
  },
  mounted() {},
  methods: {},
  computed: {
    is_mobile() {
      if(navigator) {
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          return true;
        } else {
          return this.windowWidth < 640;
        }
      }
      return this.windowWidth < 640;
    },
  },
};
