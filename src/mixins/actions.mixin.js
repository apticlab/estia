export default {
  data() {
    return {};
  },
  mounted() {},
  methods: {
    actOnRow(event) {
      let action = event.action;
      let index = event.index;

      if (this[action.callback]) {
        let row = this.rows[index];
        this[action.callback](row);
      }

      if (this.$actions[action.callback]) {
        let row = this.rows[index];
        this.$actions[action.callback](this, row);
      }
    },
    act(action, data = null) {
      if (this[action.callback]) {
        this[action.callback](data);
      }

      if (this.$actions[action.callback]) {
        this.$actions[action.callback](this, data);
      }
    },
  },
  computed: {
    visibleActions() {
      let actions = this.actions.filter((action) => {
        if (action.multi) {
          return false;
        }

        let actionScope = this.actionScope || 'list';

        let roleBasedFilter = !action.roles || action.roles.includes(this.getUserRole());
        let scopeBasedFilter = !action.scopes || action.scopes.includes(actionScope);

        return roleBasedFilter && scopeBasedFilter && this.itemIsVisible(action);
      });

      return actions;
    },
    multiActions() {
      return this.actions.filter((action) => {
        let roleBasedFilter = !action.roles || action.roles.includes(this.getUserRole());

        return action.multi && roleBasedFilter;
      });
    },
  },
};
