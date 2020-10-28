<template>
  <div class="flex flex-col flex-grow">
    <div v-if="!isLoading" class="w-full">
      <div class="flex flex-row items-baseline px-4 py-5">
        <slot name="title" />
        <div class="flex flex-row ml-auto">
          <button
            v-for="(action, index) in multiActions"
            :class="multiActionClass"
            class="outline-none focus:outline-none"
            @click="act(action)"
          >
            <span class="flex flex-row justify-center">
              <icon name="action.icon" size="m" class="mr-1 text-white"></icon>
              <span>{{ action.label }}</span>
            </span>
          </button>
        </div>
      </div>
      <div class="flex flex-row items-center px-4 my-3">
        <input
          @input="search"
          v-model="searchQuery"
          type="text"
          placeholder="Cerca"
        />
      </div>
      <transition>
        <div class="px-4 py-5">
          <awesome-table
            v-if="!resourceIsLoading"
            :header-class="headerClass"
            :table-class="tableClass"
            :row-class="rowClass"
            :striped="striped"
            :headers="headers"
            :actions="visibleActions"
            :rows="rows"
            @act="actOnRow"
          />
          <div v-if="pagination" class="flex flex-row w-full my-3">
            <t-pagination
              class="mx-auto"
              :total-items="pagination.totalItems"
              :per-page="pagination.perPage"
              :num-pages="pagination.numPages"
              :limit="5"
              :classes="paginationClasses"
              :value="currentPage"
              @change="changePage"
            />
          </div>
        </div>
      </transition>
    </div>
    <loading v-if="isLoading" class="flex-grow w-full h-64" />
  </div>
</template>
<script>
import ActionsMixin from "@/mixins/actions.mixin.js";

export default {
  name: "ListResourceBase",
  mixins: [ActionsMixin],
  props: {
    tableClass: {
      required: false,
      type: String,
      default() {
        return this.$theme.tableClass;
      }
    },
    headerClass: {
      required: false,
      type: String,
      default: "bg-gray-500 text-white"
    },
    rowClass: {
      required: false,
      type: String,
      default: "bg-gray-100 text-gray-700"
    },
    multiActionClass: {
      required: false,
      type: String,
      default: "bg-gray-100 text-gray-700"
    },
    striped: {
      required: false,
      type: Boolean,
      default: false
    },
    paginationClasses: {
      required: false,
      type: Object,
      default() {
        return this.$theme.paginationClasses;
      }
    }
  },
  data() {
    return {
      actionScope: "list",
      pagination: null,
      currentPage: 1,
      isLoading: true,
      searchQuery: null,
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
  computed: {},
  async mounted() {
    this.resourceName =
      this.$route.params.resource || this.$route.meta.resource;

    if (!this.resourceName) {
      return;
    }

    this.headers = this.resources[this.resourceName].headers || [];
    this.actions = this.resources[this.resourceName].actions || [];
    this.resourceInfo = this.resources[this.resourceName].info || {};
    this.config = this.resources[this.resourceName].config || this.baseConfig;

    await this.loadData();
  },
  methods: {
    search: _.debounce(async function() {
      await this.loadData();
    }, 350),
    async changePage(newCurrentPage) {
      console.log("Changing page: " + newCurrentPage);
      this.currentPage = newCurrentPage;
      await this.loadData();
    },
    async loadData() {
      this.isLoading = true;
      try {
        let response = await this.$api.list(this.resourceName, {
          q: this.searchQuery,
          page: this.currentPage
        });

        if (response.data) {
          this.pagination = {
            totalItems: response.total,
            perPage: response.per_page
          };

          this.rows = response.data;
        } else {
          this.rows = response || [];
        }
      } catch (e) {
        this.rows = [];
      }

      this.isLoading = false;
    },
    addResource() {
      this.$router.push({
        name: `create_${this.resourceName}`
      });
    },
    view(resource) {
      this.$router.push({
        name: `view_${this.resourceName}`,
        params: {
          id: resource.id
        }
      });
    },
    edit(resource) {
      this.$router.push({
        name: `edit_${this.resourceName}`,
        params: {
          id: resource.id
        }
      });
    },
    async delete(resource) {
      if (confirm("Vuoi davvero eliminare questa risorsa?")) {
        this.isLoading = true;
        this.$api.delete(this.resourceName, resource.id);
        this.isLoading = false;

        await this.loadData();
      }
    }
  }
};
</script>
