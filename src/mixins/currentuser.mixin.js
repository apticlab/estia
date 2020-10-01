import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState("user", {
      user: state => state.user
    })
  }
}
