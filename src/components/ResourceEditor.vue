<template>
  <div>
    <awesome-table
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

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import _ from "lodash";

const props = defineProps({
  context: {
    type: Object,
    required: false,
  },
  resource: {
    type: String,
    required: false,
  },
  readonly: {
    type: Boolean,
    required: false,
    default: false,
  },
  values: {
    required: false,
  },
});

const instance = getCurrentInstance();
const resources = instance?.appContext.config.globalProperties.resources;

const headers = ref([]);
const actions = ref([]);
const fields = ref([]);
const rows = ref([]);

const reloadRows = (newRows) => {
  if (props.context) {
    props.context.model = null;
    props.context.model = newRows;
  }

  rows.value = null;
  rows.value = newRows;
};

onMounted(() => {
  let resourceName = "";

  if (props.context) {
    resourceName = props.context.attributes.resource.name;
    rows.value = _.clone(props.context.model || []);
  } else {
    resourceName = props.resource;
    rows.value = props.values;
  }

  headers.value = resources[resourceName].headers;
  actions.value = props.readonly ? [] : resources[resourceName].actions;
  fields.value = resources[resourceName].fields;
});
</script>
