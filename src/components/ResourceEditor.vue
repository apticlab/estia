<template>
  <div>
    <awesome-table
      :debug="true"
      :headers="headers"
      :actions="actions"
      :fields="fields"
      :rows.sync="rows"
      :readonly="readonly"
      v-on:row-added="reloadRows($event)"
      v-on:row-deleted="reloadRows($event)"
    ></awesome-table>
  </div>
</template>
<script>
import _ from "lodash";

export default {
  name: "ResourceEditor",
  props: {
    context: {
      type: Object,
      required: false,
    },
    resource: {
      required: false,
      type: String,
    },
    readonly: {
      required: false,
      default: false,
    },
    values: {
      required: false,
    },
  },
  data() {
    return {
      headers: [],
      actions: [],
      fields: [],
      rows: [],
    };
  },
  mounted() {
    let resourceName = "";

    if (this.context) {
      resourceName = this.context.attributes.resource.name;
      this.rows = _.clone(this.context.model || []);
    } else {
      resourceName = this.resource;
      this.rows = this.values;
    }

    this.headers = this.resources[resourceName].headers;
    this.actions = this.readonly ? [] : this.resources[resourceName].actions;
    this.fields = this.resources[resourceName].fields;
  },
  methods: {
    reloadRows(rows) {
      this.context.model = null;
      this.context.model = rows;

      this.rows = null;
      this.rows = rows;

      console.log(rows);

      this.$forceUpdate();
    },
  },
  computed: {},
};
</script>
