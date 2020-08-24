<template>
  <div class="flex flex-col flex-grow px-3 sm:px-0">
    <div
      v-if="!isLoading"
      class="w-full"
    >
      <div
        class="flex flex-row items-baseline sm:max-w-screen-sm md:max-w-screen-md xl:max-w-screen-xl px-4 mx-auto py-5"
      >
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
        <div
          class="sm:max-w-screen-sm md:max-w-screen-md xl:max-w-screen-xl px-4 mx-auto py-5"
        >
          <awesome-table
            v-if="!resourceIsLoading"
            :header-class="headerClass"
            :add-resource-class="addResourceClass"
            :row-class="rowClass"
            :striped="striped"
            :headers="headers"
            :actions="visibleActions"
            :rows="rows"
            @act="actOnRow"
          />
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
    }
  },
  data () {
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
    }
  },
  computed: {
    newResourceLabel () {
      return 'Nuova'

      /*
      let newResourceLabel = "Aggiungi ";
      newResourceLabel += this.resourceInfo.singular ?? "Risorsa";

      return newResourceLabel;
      */
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
    async loadData () {
      this.isLoading = true
      try {
        this.rows = (await this.$api.list(this.resourceName)) || []
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
      console.log(resource)

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
