import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState("user", {
      user: state => state.user
    })
  },
  methods: {
    getUserRole() {
      if (this.$roleLookup) {
        return this.$roleLookup(this.user);
      }

      // Default roleLookup
      return this.user.role.code.toLowerCase();
    }
  }
}
