<template>
  <div class="flex flex-col flex-grow">
    <div v-if="!isLoading" class="w-full">
      <template>
        <div class="flex flex-row items-baseline py-5">
          <slot name="title" />
          <slot
            name="actions"
            :actions="multiActions"
            :actionClass="multiActionClass"
          >
            <div class="flex flex-row ml-auto">
              <button
                v-for="(action, index) in multiActions"
                :key="'lrb_action_' + index"
                :class="[
                  action.color + ' ' + multiActionClass,
                  multiActions.length > 1 ? 'ml-4' : '',
                ]"
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
          </slot>
        </div>
        <template>
          <slot name="search-input">
            <div class="flex flex-row items-center my-3">
              <search-input
                v-model="searchQuery"
                placeholder="Cerca"
                class="flex-grow"
                @input="search"
              />
            </div>
          </slot>
        </template>
      </template>
      <div class="flex flex-row items-center my-3">
        <slot name="filters" :filter-data="filterData" />
      </div>
      <div v-if="!dataLoading" class="my-3">
        <template v-if="(!card && is_mobile) || !is_mobile">
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
          <div
            v-for="(row, index) in rows"
            :key="'row_' + index"
            class="
              relative
              grid grid-cols-12
              bg-white
              rounded-[10px]
              shadow
              my-5
              mx-2
              p-4
            "
            @click="actOnRow"
          >
            <div class="absolute top-[10px] right-[10px]">
              <popper trigger="click">
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
                  <p
                    v-for="(action, i) in actions"
                    :key="'action_' + i"
                    @click="act(action, row)"
                    class="
                      text-xl text-black
                      py-2
                      pr-10
                      border-b border-gray-300
                    "
                  >
                    {{ action.label }}
                  </p>
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
            <div
              v-for="(header, index) in card"
              :key="'lrb_header_' + index"
              :class="['mb-2', header.class]"
            >
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
                <label class="font-semibold text-green-500">{{
                  header.label
                }}</label>
                <p>{{ deepPick(row, header.field) }}</p>
              </template>
              <template v-if="header.type == 'pill'">
                <div class="flex flex-row items-center h-full">
                  <span
                    class="px-3 py-1 text-xs rounded-lg"
                    :class="[
                      getPillBgColor(deepPick(row, header.field.color)),
                      deepPick(row, header.field.text_color) || 'text-white',
                    ]"
                    >{{ deepPick(row, header.field.text) }}</span
                  >
                </div>
              </template>
            </div>
          </div>
        </template>
          <t-pagination
           v-if="pagination"
            class="flex flex-row w-full my-3 gap-x-2"
            :total-items="pagination.totalItems"
            :per-page="pagination.perPage"
            :num-pages="pagination.numPages"
            :limit="5"
            :classes="paginationClasses"
            :value="currentPage"
            @change="changePage"
          />
      </div>
      <loading v-if="dataLoading" class="flex-grow w-full h-64" />
    </div>
    <loading v-if="isLoading" class="flex-grow w-full h-64" />
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import _ from "lodash";
import Pagination from '@/components/Pagination.vue';
import Icon from '@/components/Icon.vue';
import { useTheme } from '../composables/useTheme.js';

const props = defineProps({
  tableClass: {
    required: false,
    type: String,
    default: undefined,
  },
  headerClass: {
    required: false,
    type: String,
    default: "bg-gray-500 text-white",
  },
  query: {
    required: false,
    type: String,
    default: null,
  },
  rowClass: {
    required: false,
    type: String,
    default: "bg-gray-100 text-gray-700",
  },
  multiActionClass: {
    required: false,
    type: String,
    default: "bg-gray-100 text-gray-700",
  },
  propsResourceName: {
    required: false,
    type: String,
    default: null,
  },
  striped: {
    required: false,
    type: Boolean,
    default: false,
  },
  paginationClasses: {
    required: false,
    type: Object,
    default: undefined,
  },
});

const router = useRouter();
const route = useRoute();
const store = useStore();
const theme = useTheme();

const instance = getCurrentInstance();
const $api = instance.appContext.config.globalProperties.$api;
const $actions = instance.appContext.config.globalProperties.$actions;
const deepPick = instance.appContext.config.globalProperties.deepPick;
const resources = instance.appContext.config.globalProperties.resources;
const getUserRole = instance.appContext.config.globalProperties.getUserRole;
const itemIsVisible = instance.appContext.config.globalProperties.itemIsVisible;
const is_mobile = computed(() => store.getters.is_mobile);

// Provide default values using theme
const actualTableClass = computed(() => props.tableClass || theme.tableClass);
const actualPaginationClasses = computed(() => props.paginationClasses || theme.paginationClasses);

const actionScope = ref("list");
const pagination = ref(null);
const currentPage = ref(1);
const isLoading = ref(true);
const dataLoading = ref(true);
const searchQuery = ref(null);
const rows = ref(null);
const headers = ref(null);
const actions = ref(null);
const filters = ref({});
const resourceName = ref(null);
const resourceIsLoading = ref(false);
const baseConfig = ref({
  canAdd: true,
});
const card = ref(null);
const resourceInfo = ref(null);
const config = ref(null);

// Actions mixin functionality
const actOnRow = (event) => {
  let action = event.action;
  let index = event.index;
  
  const methods = {
    addResource,
    view,
    edit,
    delete: deleteResource,
  };

  if (methods[action.callback]) {
    let row = rows.value[index];
    methods[action.callback](row);
    return;
  }

  if ($actions[action.callback]) {
    let row = rows.value[index];
    $actions[action.callback](instance, row);
    return;
  }
};

const act = (action, data = null) => {
  const methods = {
    addResource,
    view,
    edit,
    delete: deleteResource,
  };

  if (methods[action.callback]) {
    methods[action.callback](data);
    return;
  }

  if ($actions[action.callback]) {
    $actions[action.callback](instance, data);
  }
};

const isActionVisible = (action, row) => {
  if (!action.visible) {
    return true;
  }

  return itemIsVisible(action, row, instance);
};

const visibleActions = computed(() => {
  if (!actions.value) return [];
  
  return actions.value.filter((action) => {
    if (action.multi) {
      return false;
    }

    let roleBasedFilter = !action.roles || action.roles.includes(getUserRole());
    let scopeBasedFilter = !action.scopes || action.scopes.includes(actionScope.value);
    let visibilityFilter = itemIsVisible(action, instance);

    return roleBasedFilter && scopeBasedFilter && visibilityFilter;
  });
});

const scopedActions = computed(() => {
  if (!actions.value) return [];
  
  return actions.value.filter((action) => {
    if (action.multi) {
      return false;
    }

    let roleBasedFilter = !action.roles || action.roles.includes(getUserRole());
    let scopeBasedFilter = true;
    if (!action.default) {
      scopeBasedFilter = !action.scopes || action.scopes.includes(actionScope.value);
    }
    return roleBasedFilter && scopeBasedFilter;
  });
});

const multiActions = computed(() => {
  if (!actions.value) return [];
  
  return actions.value.filter((action) => {
    let roleBasedFilter = !action.roles || action.roles.includes(getUserRole());
    return action.multi && roleBasedFilter;
  });
});

const getPillBgColor = (color) => {
  if (!color) {
    return "bg-gray-500";
  }
  return color;
};

const search = _.debounce(async function () {
  // When searching "reset" pagination
  currentPage.value = 1;
  await loadData();
}, 350);

const changePage = async (newCurrentPage) => {
  currentPage.value = newCurrentPage;
  await loadData();
};

const loadData = async () => {
  dataLoading.value = true;
  try {
    let response = await $api.list(resourceName.value, {
      q: searchQuery.value,
      filters: filters.value,
      page: currentPage.value,
    });

    if (response.data) {
      pagination.value = {
        totalItems: response.total,
        perPage: response.per_page,
      };

      rows.value = response.data;
    } else {
      rows.value = response || [];
    }
  } catch (e) {
    rows.value = [];
  }

  dataLoading.value = false;
};

const filterData = async (filtersData) => {
  filters.value = filtersData;
  await loadData();
};

const addResource = () => {
  router.push({
    name: `create_${resourceName.value}`,
  });
};

const view = (resource) => {
  router.push({
    name: `view_${resourceName.value}`,
    params: {
      id: resource.id,
    },
  });
};

const edit = (resource) => {
  router.push({
    name: `edit_${resourceName.value}`,
    params: {
      id: resource.id,
    },
  });
};

const deleteResource = async (resource) => {
  if (confirm("Vuoi davvero eliminare questa risorsa?")) {
    isLoading.value = true;
    $api.delete(resourceName.value, resource.id);
    isLoading.value = false;

    await loadData();
  }
};

watch(() => props.query, (newV, oldV) => {
  searchQuery.value = newV;
  search();
});

onMounted(async () => {
  resourceName.value =
    props.propsResourceName ||
    route.params.resource ||
    route.meta.resource;

  if (!resourceName.value) {
    return;
  }

  headers.value = resources[resourceName.value].headers || [];
  actions.value = resources[resourceName.value].actions || [];
  resourceInfo.value = resources[resourceName.value].info || {};
  config.value = resources[resourceName.value].config || baseConfig.value;
  card.value = resources[resourceName.value].card || null;

  isLoading.value = true;
  await loadData();
  isLoading.value = false;
});
</script>
