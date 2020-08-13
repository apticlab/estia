<template>
  <div class="flex flex-col flex-grow">
    <transition name="slide-fade">
      <div class="py-3 w-full" v-if="!isLoading">
        <awesome-table
          :headers="headers"
          :actions="actions"
          :rows="accounts"
          @act="actOnRow"
        ></awesome-table>
      </div>
    </transition>
    <transition name="slide-fade">
      <loading v-if="isLoading" class="flex-grow w-full h-64"></loading>
    </transition>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import { accounts } from "@/services/headers";

export default {
  name: "ListAccounts",
  props: {},
  data() {
    return {
      isLoading: true,
      actions: accounts.actions,
      headers: accounts.headers
    };
  },
  async mounted() {
    this.isLoading = true;
    await this.get_accounts();
    this.isLoading = false;
  },
  methods: {
    ...mapActions("users", ["get_accounts"]),
    actOnRow(action, row) {}
  },
  computed: {
    ...mapState("users", {
      accounts: state => state.accounts
    })
  }
};
</script>
