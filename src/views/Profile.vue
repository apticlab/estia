<template>
  <div class="px-4 py-3">
    <div v-if="userToShow.isActive">
      <user-detail :user="userToShow"></user-detail>
    </div>
  </div>
</template>
<script>
import { getProfile } from "../utils/auth.js";

export default {
  data() {
    return {
      error: null,
      isLoading: true,
      userToShow: {}
    };
  },
  async mounted() {
    this.isLoading = true;

    this.state = "first_login";
    this.userToShow = getProfile();

    this.isLoading = false;
  },
  methods: {},
  watch: {},
  computed: {}
};
</script>
