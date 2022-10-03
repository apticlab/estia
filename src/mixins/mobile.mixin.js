export default {
  data() {
    return {};
  },
  mounted() { },
  methods: {},
  computed: {
    is_mobile() {
      if (navigator) {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          return true;
        } else {
          return this.windowWidth < 640;
        }
      }
      return this.windowWidth < 640;
    },
    screen() {
      let dimension = 'mobile';

      if (this.windowWidth >= 640) {
        dimension = 'sm';
      } else if (this.windowWidth >= 768) {
        dimension = 'md';
      } else if (this.windowWidth >= 1024) {
        dimension = 'lg';
      } else if (this.windowWidth >= 1280) {
        dimension = 'xl';
      } else if (this.windowWidth >= 1536) {
        dimension = '2xl';
      }
      return dimension;
    }
  },
};
