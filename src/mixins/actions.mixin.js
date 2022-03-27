export default {
  data() {
    return {}
  },
  mounted() { },
  methods: {
    actOnRow(event) {
      let action = event.action
      let index = event.index

      if (this[action.callback]) {
        let row = this.rows[index]
        this[action.callback](row)
      }

      if (this.$actions[action.callback]) {
        let row = this.rows[index]
        this.$actions[action.callback](this, row)
      }
    },
    act(action, data = null) {
      if (this[action.callback]) {
        this[action.callback](data)
      }

      if (this.$actions[action.callback]) {
        this.$actions[action.callback](this, data)
      }
    },
    isActionVisible(action, row) {
      if (!action.visible) {
        return true
      }

      return this.itemIsVisible(action, row, this)
    }
  },
  computed: {
    visibleActions() {
      let actions = this.actions.filter((action) => {
        if (action.multi) {
          return false
        }

        let actionScope = this.actionScope || 'list'

        let roleBasedFilter = !action.roles || action.roles.includes(this.getUserRole())
        let scopeBasedFilter = !action.scopes || action.scopes.includes(actionScope)
        let visibilityFilter = this.itemIsVisible(action, this)

        return roleBasedFilter && scopeBasedFilter && visibilityFilter
      })

      return actions
    },
    scopedActions() {
      let actions = this.actions.filter((action) => {
        if (action.multi) {
          return false
        }

        let actionScope = this.actionScope || 'list'

        let roleBasedFilter = !action.roles || action.roles.includes(this.getUserRole())
        let scopeBasedFilter = !action.scopes || action.scopes.includes(actionScope)

        return roleBasedFilter && scopeBasedFilter
      })

      return actions
    },
    multiActions() {
      return this.actions.filter((action) => {
        let roleBasedFilter = !action.roles || action.roles.includes(this.getUserRole())

        return action.multi && roleBasedFilter
      })
    }
  }
}
