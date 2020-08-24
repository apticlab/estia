<template>
  <div class="flex flex-col flex-grow">
    <div
      v-if="!isLoading"
      class="w-full"
    >
      <div class="flex flex-row items-baseline px-4 py-5">
        <slot name="title" />
        <button
          v-if="config.canAdd"
          :class="addResourceClass"
          class="outline-none ml-auto focus:outline-none"
          @click="addResource()"
        >
          <span class="flex flex-row justify-center">
            <i class="ti-plus mr-2 mt-1 text-md" />
            <span>{{ newResourceLabel }}</span>
          </span>
        </button>
      </div>
      <transition>
        <div class="px-4 py-5">
          <awesome-table
            v-if="!resourceIsLoading"
            :header-class="headerClass"
            :add-resource-class="addResourceClass"
            :table-class="tableClass"
            :row-class="rowClass"
            :striped="striped"
            :headers="headers"
            :actions="visibleActions"
            :rows="rows"
            @act="actOnRow"
          />
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
      </transition>
    </div>
    <loading
      v-if="isLoading"
      class="flex-grow w-full h-64"
    />
  </div>
</template>
<script>
export default {
  name: 'ListResourceBase',
  props: {
    tableClass: {
      required: false,
      type: String,
      default: 'max-w-screen-xl'
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
    addResourceClass: {
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
        return {
          wrapper: 'flex',
          element: 'w-8 h-8 mx-1',
          disabledElement: 'w-8 h-8 mx-1',
          ellipsisElement: 'w-8 h-8 mx-1',
          activeButton: 'bg-blue-500 w-full h-full text-white rounded-full ',
          disabledButton:
            'opacity-25 w-full h-full cursor-not-allowed rounded-full',
          button: 'hover:bg-blue-100 w-full h-full text-blue-500 rounded-full ',
          ellipsis: 'text-gray-500'
        }
      }
    }
  },
  data () {
    return {
      pagination: null,
      currentPage: 1,
      isLoading: true,
      rows: null,
      headers: null,
      actions: null,
      resourceName: null,
      resourceIsLoading: false,
      baseConfig: {
        canAdd: true
      }
    }
  },
  computed: {
    newResourceLabel () {
      return 'Nuova'
    },
    visibleActions () {
      return this.actions.filter((action) => {
        return !action.scopes || action.scopes.includes('list')
      })
    }
  },
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

    await this.loadData()
  },
  methods: {
    async changePage (newCurrentPage) {
      console.log('Changing page: ' + newCurrentPage)
      this.currentPage = newCurrentPage
      await this.loadData()
    },
    async loadData () {
      this.isLoading = true
      try {
        let response = await this.$api.list(this.resourceName, {
          page: this.currentPage
        })

        console.log(response)

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

      this.isLoading = false
    },
    actOnRow (event) {
      let action = event.action
      let index = event.index

      if (this[action.callback]) {
        let row = this.rows[index]
        this[action.callback](row)
      }
    },
    addResource () {
      this.$router.push(`create`)
    },
    view (resource) {
      this.$router.push(`view/${resource.id}`)
    },
    edit (resource) {
      this.$router.push(`edit/${resource.id}`)
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
