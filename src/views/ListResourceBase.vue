<template>
  <div class="flex flex-col flex-grow">
    <div
      v-if="!isLoading"
      class="w-full"
    >
      <div class="flex flex-row items-baseline py-5">
        <slot name="title" />
        <div class="flex flex-row ml-auto">
          <button
            v-for="(action, index) in multiActions"
            :key="'lrb_action_' + index"
            :class="multiActionClass"
            class="outline-none focus:outline-none"
            @click="act(action)"
          >
            <span class="flex flex-row items-center">
              <icon
                :name="action.icon"
                color="text-white"
                size="m"
                class="mr-1"
              />
              <span>{{ action.label }}</span>
            </span>
          </button>
        </div>
      </div>
      <div class="flex flex-row items-center my-3">
        <search-input
          v-model="searchQuery"
          placeholder="Cerca"
          class="flex-grow"
          @input="search"
        />
      </div>
      <div class="flex flex-row items-center my-3">
        <slot
          name="filters"
          :filter-data="filterData"
        />
      </div>
      <div
        v-if="!dataLoading"
        class="my-3"
      >
        <template v-if='(!card && is_mobile) || !is_mobile'>
          <awesome-table
            v-if="!resourceIsLoading"
            :header-class="headerClass"
            :table-class="tableClass"
            :row-class="rowClass"
            :striped="striped"
            :headers="headers"
            :actions="scopedActions"
            :rows="rows"
            @act="actOnRow"
          />
        </template>
        <template v-else>
          <div v-for='(row, index) in rows' :key="'row_' + index" class="relative grid grid-cols-12 bg-white rounded-[10px] shadow my-5 mx-2 p-4" @click="actOnRow">
            <div class="absolute top-[10px] right-[10px]">
              <popper
                trigger="click"
              >
                <div
                  class="
                  popper
                  shadow-md
                  bg-white
                  text-gray-700
                  rounded
                  py-1
                  px-2
                  w-3/6
                  "
                >
                  <p v-for='(action, i) in actions' :key="'action_' + i" @click="act(action, row)" class="text-xl text-black py-2 pr-10 border-b border-gray-300">{{ action.label }}</p>
                </div>
                <icon
                  slot="reference"
                  name="dots-vertical"
                  size="l"
                  color="text-gray-500"
                  class="mr-1 focus:outline-none p-1"
                  :stop-propagation="true"
                />
              </popper>
            </div>
            <div v-for="(header, index) in card" :key="'lrb_header_' + index" :class="['mb-2', header.class]">
              <template v-if="header.type == 'details'">
                <div class="flex flex-col">
                  <div class="mb-1 text-base">
                    {{ deepPick(row, header.field.title) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ deepPick(row, header.field.description) }}
                  </div>
                </div>
              </template>
              <template v-else>
                <label class="font-semibold text-green-500">{{ header.label }}</label>
                <p> {{ deepPick(row, header.field) }}</p>
              </template>
              <template
                v-if="header.type == 'pill'"
              >
                <div class="flex flex-row items-center h-full">
                  <span
                    class="px-3 py-1 text-xs rounded-lg"
                    :class="[
                      getPillBgColor(deepPick(row, header.field.color)),
                      deepPick(row, header.field.text_color) || 'text-white',
                    ]"
                  >{{ deepPick(row, header.field.text) }}</span>
                </div>
              </template>
            </div>
          </div>
        </template>
        <div
          v-if="pagination"
          class="flex flex-row w-full my-3"
        >
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
      <loading
        v-if="dataLoading"
        class="flex-grow w-full h-64"
      />
    </div>
    <loading
      v-if="isLoading"
      class="flex-grow w-full h-64"
    />
  </div>
</template>
<script>
  import ActionsMixin from '@/mixins/actions.mixin.js'

  export default {
    name: 'ListResourceBase',
    mixins: [ActionsMixin],
    props: {
      tableClass: {
        required: false,
        type: String,
        default () {
          return this.$theme.tableClass
        }
      },
      headerClass: {
        required: false,
        type: String,
        default: 'bg-gray-500 text-white'
      },
      rowClass: {
        required: false,
        type: String,
        default: 'bg-gray-100 text-gray-700'
      },
      multiActionClass: {
        required: false,
        type: String,
        default: 'bg-gray-100 text-gray-700'
      },
      striped: {
        required: false,
        type: Boolean,
        default: false
      },
      paginationClasses: {
        required: false,
        type: Object,
        default () {
          return this.$theme.paginationClasses
        }
      }
    },
    data () {
      return {
        actionScope: 'list',
        pagination: null,
        currentPage: 1,
        isLoading: true,
        dataLoading: true,
        searchQuery: null,
        rows: null,
        headers: null,
        actions: null,
        filters: {},
        resourceName: null,
        resourceIsLoading: false,
        baseConfig: {
          canAdd: true
        },
        card: null
      }
    },
    computed: {},
    async mounted () {
      this.resourceName =
      this.$route.params.resource || this.$route.meta.resource

      if (!this.resourceName) {
        return
      }

      this.headers = this.resources[this.resourceName].headers || []
      this.actions = this.resources[this.resourceName].actions || []
      this.resourceInfo = this.resources[this.resourceName].info || {}
      this.config = this.resources[this.resourceName].config || this.baseConfig
      this.card = this.resources[this.resourceName].card || null;

      this.isLoading = true
      await this.loadData()
      this.isLoading = false
    },
    methods: {
      getPillBgColor(color) {
        if (!color) {
          return "bg-gray-500";
        }
        return color;
      },
      search: _.debounce(async function () {
        // When searching "reset" pagination
        this.currentPage = 1
        await this.loadData()
      }, 350),
      async changePage (newCurrentPage) {
        this.currentPage = newCurrentPage
        await this.loadData()
      },
      async loadData () {
        this.dataLoading = true
        try {
          let response = await this.$api.list(this.resourceName, {
            q: this.searchQuery,
            filters: this.filters,
            page: this.currentPage
          })

          if (response.data) {
            this.pagination = {
              totalItems: response.total,
              perPage: response.per_page
            }

            this.rows = response.data
          } else {
            this.rows = response || []
          }
        } catch (e) {
          this.rows = []
        }

        this.dataLoading = false
      },
      async filterData (filters) {
        this.filters = filters
        await this.loadData()
      },
      addResource () {
        this.$router.push({
          name: `create_${this.resourceName}`
        })
      },
      view (resource) {
        this.$router.push({
          name: `view_${this.resourceName}`,
          params: {
            id: resource.id
          }
        })
      },
      edit (resource) {
        this.$router.push({
          name: `edit_${this.resourceName}`,
          params: {
            id: resource.id
          }
        })
      },
      async delete (resource) {
        if (confirm('Vuoi davvero eliminare questa risorsa?')) {
          this.isLoading = true
          this.$api.delete(this.resourceName, resource.id)
          this.isLoading = false

          await this.loadData()
        }
      }
    }
  }
</script>
