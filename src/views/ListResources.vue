<template>
  <div class="flex flex-col flex-grow px-3 sm:px-0">
    <div class="w-full" v-if="!isLoading">
      <div class="flex flex-row items-baseline sm:max-w-screen-sm md:max-w-screen-md xl:max-w-screen-xl px-4 mx-auto py-5">
        <button
          v-if="config.canAdd"
          @click="addResource()"
          class="px-4 bg-blue outline-none rounded-none text-white ml-auto focus:outline-none hover:bg-blue-dark"
        >
          <span class="flex flex-row justify-center">
            <i class="ti-plus mr-2 mt-1 text-md"></i>
            <span>{{ newResourceLabel }}</span>
          </span>
        </button>
      </div>
      <transition>
        <div class="sm:max-w-screen-sm md:max-w-screen-md xl:max-w-screen-xl px-4 mx-auto py-5">
          <awesome-table
            v-if="!resourceIsLoading"
            :headers="headers"
            :actions="visibleActions"
            :rows="rows"
            @act="actOnRow"
          ></awesome-table>
        </div>
      </transition>
    </div>
    <loading v-if="isLoading" class="flex-grow w-full h-64"></loading>
  </div>
</template>
<script>
import { resources } from "@/resources/index";
import { api } from "@/utils/api";

export default {
  name: "ListResources",
  props: {},
  data() {
    return {
      isLoading: true,
      rows: null,
      headers: null,
      actions: null,
      resourceName: null,
      resourceIsLoading: false,
      baseConfig: {
        canAdd: true
      }
    };
  },
  async mounted() {
    this.resourceName =
      this.$route.params.resource || this.$route.meta.resource;

    if (!this.resourceName) {
      return;
    }

    this.headers = resources[this.resourceName].headers || [];
    this.actions = resources[this.resourceName].actions || [];
    this.resourceInfo = resources[this.resourceName].info || {};
    this.config = resources[this.resourceName].config || this.baseConfig;

    await this.loadData();
  },
  methods: {
    async loadData() {
      this.isLoading = true;
      this.rows = (await api.list(this.resourceName)) || [];
      this.isLoading = false;
    },
    actOnRow(event) {
      let action = event.action;
      let index = event.index;

      if (this[action.callback]) {
        let row = this.rows[index];
        this[action.callback](row);
      }
    },
    addResource() {
      this.$router.push(`create`);
    },
    view(resource) {
      this.$router.push(`view/${resource.id}`);
    },
    edit(resource) {
      this.$router.push(`edit/${resource.id}`);
    },
    async delete(resource) {
      console.log(resource);

      if (confirm("Vuoi davvero eliminare questa risorsa?")) {
        this.isLoading = true;
        this.$api.delete(this.resourceName, resource.id);
        this.isLoading = false;

        await this.loadData();
      }
    }
  },
  computed: {
    newResourceLabel() {
      return "Nuova";

      /*
      let newResourceLabel = "Aggiungi ";
      newResourceLabel += this.resourceInfo.singular ?? "Risorsa";

      return newResourceLabel;
      */
    },
    visibleActions() {
      return this.actions.filter(action => {
        return !action.scopes || action.scopes.includes("list");
      });
    }
  }
};
</script>
