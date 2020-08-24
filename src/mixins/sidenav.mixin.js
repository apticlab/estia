export default {
  data() {
    return {
      is_collapsed: false,
      show_text: true,
    };
  },
  created() {},
  beforeMount() {
    this.getSideBarCollapseState();
  },
  methods: {
    getSideBarCollapseState() {
      if (localStorage.getItem('is_collapsed')) {
        this.is_collapsed = JSON.parse(localStorage.getItem('is_collapsed')) ? true : false;
      } else {
        if (this.is_mobile) {
          this.is_collapsed = true;
        }
      }

      if (!this.is_collapsed) return 0;
      this.show_text = false;
    },
    collapseSideBar() {
      const expanding = this.is_collapsed;
      if (expanding) {
        this.log('show-text', this.is_mobile);

        if (this.is_mobile) {
          this.show_text = !this.show_text;
          this.EventBus.$emit('side-bar:show-text', this.show_text);
        } else {
          // in modalità desktop il tempo del timeout deve essere
          // minore di 100ms rispetto alla durata dell'animazione
          setTimeout(() => {
            this.show_text = !this.show_text;
            this.EventBus.$emit('side-bar:show-text', this.show_text);
          }, 200);
        }
      } else {
        this.show_text = !this.show_text;
        this.EventBus.$emit('side-bar:show-text', this.show_text);
      }

      this.is_collapsed = !this.is_collapsed;
      localStorage.setItem('is_collapsed', this.is_collapsed);
      this.EventBus.$emit('side-bar:collapse', this.is_collapsed);
    },
    listenForSideNavCollapseEvent() {
      this.EventBus.$on('side-bar:collapse', (value) => {
        this.is_collapsed = value;
      });
      this.EventBus.$on('side-bar:show-text', (value) => {
        this.show_text = value;
      });
    },
    routeSectionTitle () {
      let labels = this.$route.matched
        .map((route) => (route.meta ? route.meta.label : null))
        .reverse()

      // Return the first not null && not undefined label
      return labels.find((label) => !!label)
    },
  },
};
