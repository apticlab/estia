<template>
  <div class="inline-block min-w-full align-middle">
    <div v-if="fields && !readonly" class="flex flex-row">
      <div :class="addResourceClass" class="flex flex-row items-center ml-auto cursor-pointer" @click="addRow()">
        <i class="mr-2 ti-plus" />
        <span>Aggiungi</span>
      </div>
    </div>
    <table class="w-full border-collapse table-auto" :class="tableClass">
      <thead>
        <tr :class="{
          [headerClass]: true,
        }">
          <th v-for="(header, index) in visibleHeaders" :key="index" :style="header.style"
            :class="[getHeaderClass(header)]" class="px-4 py-3 font-semibold text-md">
            <div class="flex flex-row" :class="getHeaderClass(header)">
              {{ $t(header.label) }}
            </div>
          </th>
          <th v-if="actions.length || selectable" class="px-4 py-3 font-semibold text-md">
            <div class="flex flex-row justify-center" :class="headerClass">
              Azioni
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, index) in rows" :key="index">
          <tr class="cursor-pointer" :class="rowClass" @click="handleRowClick(row, index)">
            <td v-for="(header, index) in visibleHeaders" :key="index" class="px-4 py-4">
              <div class="flex flex-row items-center h-full text-gray-800" :class="getRowClass(header)">
                <div v-if="header.type == 'image'" class="flex flex-row items-center justify-center flex-grow">
                  <img :src="getImage(row, header.field)"
                    class="object-cover w-10 h-10 bg-gray-400 bg-no-repeat bg-auto rounded-lg" />
                </div>

                <div v-if="header.type == 'link'" class="flex flex-row items-end">
                  <a class="px-4 py-2 text-white bg-blue-600-500 btn rounded-md" target="_blank" :href="deepPick(row, header.fields.url_link)
                    ">{{ $t(deepPick(row, header.fields.url_name)) }}</a>
                </div>

                <div v-if="header.type == 'tag'" class="flex flex-row items-end">
                  <span>{{ deepPick(row, header.field).length || 0 }}</span>
                </div>

                <div v-if="header.type == 'timeago'" class="flex flex-row items-center">
                  <span class>
                    {{ timeAgo(deepPick(row, header.field)) }}
                  </span>
                </div>

                <div v-if="header.type == 'date'" class="flex flex-row items-center">
                  <span v-if="deepPick(row, header.field)" class>
                    {{
                      formatDate(
                        deepPick(row, header.field),
                        header.dateFormat
                      )
                    }}
                  </span>
                  <span v-else class="text-gray-400 italic">
                    {{ header.on_empty }}
                  </span>
                </div>

                <div v-if="header.type == 'time'" class="flex flex-row items-center">
                  <span>{{ deepPick(row, header.field) }}</span>
                </div>

                <div v-if="header.type == 'text'" class="flex flex-row items-end">
                  <span :class="header.class" v-if="deepPick(row, header.field, header.type)"
                    :title="deepPick(row, header.field, header.type)">
                    {{
                      truncate(
                        deepPick(row, header.field, header.type),
                        header.truncate
                      )
                    }}
                  </span>
                  <span v-else>{{ header.on_empty }}</span>
                </div>

                <div v-if="header.type == 'number'" class="flex flex-row items-end">
                  <span :class="header.class" v-if="deepPick(row, header.field, header.type)">
                    {{ deepPick(row, header.field, header.type) }}
                    <span v-if="header.udm" :class="header.udm.class || ''">{{
                      isObject(header.udm)
                        ? deepPick(row, header.udm.code)
                        : header.udm
                    }}</span>
                  </span>
                  <span v-else class="text-gray-400">{{
                    header.on_empty
                    }}</span>
                </div>

                <div v-if="header.type == 'hashtag'" class="flex flex-row items-end">
                  <span class="font-medium text-blue-600-700 underline cursor-pointer">#{{ deepPick(row, header.field)
                    }}</span>
                </div>

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

                <template v-if="header.type == 'stock'">
                  <div class="flex flex-row">
                    <span class="text-base font-bold">{{
                      deepPick(row, header.fields.current_value)
                      }}</span>
                    <div class="ml-2" :class="deepPick(row, header.fields.flow) == 'plus'
                        ? 'text--600'
                        : 'text-red-500'
                      ">
                      <i class="mx-1" :class="deepPick(row, header.fields.flow) == 'plus'
                          ? 'hi-trending-up'
                          : 'hi-trending-down'
                        " />
                      <span>{{ deepPick(row, header.fields.trend) }}%</span>
                    </div>
                  </div>
                </template>

                <template v-if="header.type == 'count'">
                  <div class>
                    {{ count(deepPick(row, header.field)) }}
                  </div>
                </template>

                <div v-if="header.type == 'recursivity-picker'">
                  <recursivity-view :week="deepPick(row, header.field)" />
                </div>

                <div v-if="header.type == 'pill'" class="flex flex-row items-center h-full">
                  <span class="px-3 py-1 text-xs rounded-lg" :class="[
                    getPillBgColor(deepPick(row, header.field.color)),
                    deepPick(row, header.field.text_color) || 'text-white',
                  ]">{{ deepPick(row, header.field.text) }}</span>
                </div>

                <div v-if="header.type == 'friendship'" class="flex flex-row justify-center h-full w-full items-center">
                  <span class="rounded-full h-5 w-5" :class="deepPick(row, header.field)
                      ? 'bg-green-300'
                      : 'bg-gray-200'
                    " />
                </div>

                <div v-if="header.type == 'boolean'" class="flex flex-row justify-center h-full w-full items-center">
                  <span class="rounded-full h-5 w-5" :class="deepPick(row, header.field)
                      ? 'bg-green-300'
                      : 'bg-red-300'
                    " />
                </div>

                <div v-if="header.type == 'partnership'" class="flex flex-row items-center h-full">
                  <div class="w-5 h-5 rounded-full" :class="deepPick(row, header.field) ? 'bg-green-400' : ''" />
                </div>

                <div v-if="header.type == 'status'" class="h-full w-full flex flex-col items-center">
                  <div :class="{
                    'bg-green-400': row.isActive,
                    'bg-red-400': !row.isActive,
                  }" class="w-5 h-5 rounded-full bg-gray-400" />
                </div>
                <div v-if="header.type == 'percentage'" class="h-full w-full flex flex-col items-center">
                  {{ percentage(deepPick(row, header.field)) }}
                </div>
                <div v-if="header.type == 'horizontalpiechart'" class="h-full w-full flex flex-col items-center">
                  <horizontal-pie-chart :values="header.values" :elem="row" />
                </div>

                <div v-if="$viewFields[header.type]">
                  <component :is="$viewFields[header.type]" :context="header.context"
                    :field="deepPick(row, header.field)" />
                </div>

                <div v-if="header.field == 'actions'" class="h-full flex flex-col items-end">
                  <div class="flex-grow flex flex-row justify-center items-center transition-all duration-75 ease-in" />
                </div>
              </div>
            </td>
            <td v-if="actions.length || selectable" style="width: 20%" class="px-6 py-4 whitespace-no-wrap">
              <div v-if="!selectable" class="flex flex-row items-center justify-center">
                <template v-for="action in actions">
                  <popper v-if="isActionVisible(action, row)" :key="action.name" trigger="hover">
                    <div class="popper shadow-md bg-white text-gray-700 rounded py-1 px-2">
                      {{ action.label }}
                    </div>
                    <span slot="reference">
                      <icon slot="reference" :name="action.icon" :class="action.class"
                        :size="action.size || $theme.aw_table.actionDefaultSize" :color="action.color || $theme.aw_table.actionDefaultColor
                          " class="mr-1 focus:outline-none p-1" :stop-propagation="true"
                        @click="actOnRow(action, index)" />
                    </span>
                  </popper>
                </template>
              </div>
              <div v-else class="flex flex-row items-center justify-center">
                <div
                  class="rounded-full h-6 w-6 flex flex-row items-center justify-center hover:bg-gray-700 text-white border-2 border-gray-700"
                  :class="isSelected(row) ? 'bg-gray-700 tx-white' : 'bg-white'" @click="selectRow(row)">
                  <!-- <i class="fa fa-check text-xs" :class="isSelected(row) ? 'text-white' : 'text-gray-700'"></i> -->
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="editIndex == index" :key="'0_' + index">
            <td :colspan="headers.length + 2">
              <div v-if="!readonly && fields" class="bg-blue-600-light p-5 my-2">
                <awesome-form :form.sync="resourceToEdit" :is_edit="true" :headers="fields" :validate="true"
                  @valid="onFormValid" @change="onFormChange" />
                <div class="flex flex-row w-full mt-5">
                  <div class="ml-auto">
                    <button v-show="mode == 'edit'"
                      class="btn bg-transparent text-gray-600 mr-3 active:outline-none focus:outline-none hover:text-gray-800"
                      @click="cancelCreation()">
                      Annulla
                    </button>
                    <button :disabled="!resourceToEditValid"
                      class="bg-blue-600 text-white disabled:bg-gray-light disabled:text-gray disabled:cursor-not-allowed focus:outline-none"
                      @click="createNew()">
                      {{ mode == "edit" ? "Salva" : "Aggiungi" }}
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="fields && !readonly" class="flex flex-row" />
            </td>
          </tr>
        </template>
        <tr v-if="editIndex == 'add'">
          <td :colspan="headers.length + 2">
            <div v-if="!readonly && fields" class="bg-blue-600-light p-5 my-2">
              <awesome-form :form.sync="resourceToEdit" :is_edit="false" :headers="fields" :validate="true"
                @valid="onFormValid" @change="onFormChange" />
              <div class="flex flex-row w-full mt-5">
                <div class="ml-auto">
                  <button
                    class="btn bg-transparent text-gray-600 mr-3 active:outline-none focus:outline-none hover:text-gray-800"
                    @click="cancelCreation()">
                    Annulla
                  </button>
                  <button :disabled="!resourceToEditValid"
                    class="bg-blue-600 text-white disabled:bg-gray-light disabled:text-gray disabled:cursor-not-allowed focus:outline-none"
                    @click="createNew()">
                    {{ mode == "edit" ? "Salva" : "Aggiungi" }}
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
        <tr v-if="!rows || rows.length == 0">
          <td :colspan="headers.length + 2">
            <slot name="no-data">
              <div class="text-center text-gray text-md font-semibold bg-white py-5">
                Nessuna riga da mostrare
              </div>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { computed, getCurrentInstance, ref, watch } from "vue";
import _ from "lodash";
import { isObject as lodashIsObject } from "lodash";
import Popper from "@/components/Popper.vue";
import Icon from "@/components/Icon.vue";
import {
  time_ago as timeAgo,
  date as formatDate,
  truncate,
  count,
  percentage,
} from "@/filters";
import {
  deepPick,
  evaluateCondition,
  itemIsVisible,
} from "@/utils/helpers.js";

defineOptions({ name: "AwesomeTable" });

const props = defineProps({
  rows: { type: Array, required: true, default: () => [] },
  headers: { type: Array, required: true, default: () => [] },
  actions: { type: Array, default: () => [] },
  fields: { type: Array, default: null },
  addResourceClass: { type: String, default: "" },
  headerClass: { type: String, default: "" },
  rowClass: { type: String, default: "" },
  theme: { type: String, default: "green" },
  striped: { type: Boolean, default: true },
  shadow: { type: Boolean, default: true },
  selectable: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  tableClass: { type: String, default: "" },
  actionScope: { type: String, default: "list" },
});

const emit = defineEmits(["act", "click", "selected", "row-added", "row-deleted"]);

const { proxy } = getCurrentInstance();

const defaultAction = ref(null);
const selected_row = ref(null);
const mode = ref("create");
const resourceToEdit = ref({});
const resourceToEditValid = ref(false);
const editIndex = ref(null);

const isObject = lodashIsObject;

const visibleHeaders = computed(() =>
  props.headers.filter((header) => {
    if (!header.roles) {
      return true;
    }
    return header.roles.includes(getUserRoleValue());
  })
);

const getUserRoleValue = () => proxy?.getUserRole?.() ?? "";

watch(
  () => props.actions,
  (actions = []) => {
    defaultAction.value = actions.find((action) => action.default) || null;
  },
  { immediate: true, deep: true }
);

function getImage(obj, header) {
  return deepPick(obj, header.field);
}

function getRowClass(header) {
  if (header.class && header.class.row) {
    return header.class.row;
  }
  return header.class || "justify-center";
}

function getHeaderClass(header) {
  if (header.class && header.class.header) {
    return header.class.header;
  }
  return header.class || "justify-center";
}

function getSelectedRowClass(row) {
  let rowClass = "";
  if (props.selectable) {
    rowClass += " hover:bg-gray-200 cursor-pointer";
    if (row.id === (selected_row.value ? selected_row.value.id : -1)) {
      rowClass += " bg-gray-200";
    }
  }
  return rowClass;
}

function isSelected(row) {
  if (!selected_row.value) return false;
  return selected_row.value.id === row.id;
}

function handleRowClick(row, index) {
  if (props.selectable) {
    selectRow(row);
    return;
  }

  if (defaultAction.value) {
    emit("act", {
      action: defaultAction.value,
      index,
    });
  } else {
    emit("click", index);
  }
}

function actOnRow(action, index) {
  if (!props.fields) {
    emit("act", {
      action,
      index,
    });
    return;
  }

  const callbackName = action.callback;
  if (!callbackName) {
    return;
  }

  const targetRow = props.rows[index];
  const localHandler = proxy?.[callbackName];
  if (typeof localHandler === "function") {
    localHandler(targetRow);
    return;
  }

  const globalHandler = proxy?.$actions?.[callbackName];
  if (typeof globalHandler === "function") {
    globalHandler(proxy, targetRow);
  }
}

function act(action, data = null) {
  const callbackName = action.callback;
  if (!callbackName) {
    return;
  }

  const localHandler = proxy?.[callbackName];
  if (typeof localHandler === "function") {
    localHandler(data);
    return;
  }

  const globalHandler = proxy?.$actions?.[callbackName];
  if (typeof globalHandler === "function") {
    globalHandler(proxy, data);
  }
}

function isActionVisible(action, row) {
  if (!action.visible) {
    return true;
  }
  return itemIsVisible(action, row, proxy);
}

function getActionVisibility(action, row) {
  if (!action.visible) {
    return true;
  }

  let negative = action.visible[0] === "!";
  let field = action.visible;

  if (negative) {
    field = action.visible.substring(1, action.visible.length);
  }

  const value = deepPick(row, field);
  return negative ? !value : !!value;
}

function selectRow(row) {
  selected_row.value = row;
  emit("selected", { row: selected_row.value });
}

function cancelCreation() {
  resourceToEdit.value = {};
  mode.value = "create";
  editIndex.value = null;
}

function canAdd() {
  let canAddFlag = true;
  (props.fields || []).forEach((field) => {
    if (field.validator) {
      field.validator.forEach((validator) => {
        if (validator === "required") {
          canAddFlag = canAddFlag && !!resourceToEdit.value[field.field];
        }
      });
    }
  });
  return canAddFlag;
}

function addRow() {
  mode.value = "create";
  editIndex.value = "add";
  resourceToEdit.value = {};
}

function createNew() {
  const newRow = _.clone(resourceToEdit.value);
  resourceToEdit.value = {};

  const updatedRows = _.clone(props.rows);
  if (mode.value !== "edit") {
    updatedRows.push(newRow);
  } else if (editIndex.value !== null) {
    updatedRows[editIndex.value] = newRow;
  }

  mode.value = "create";
  editIndex.value = null;

  emit("row-added", updatedRows);
}

function edit(index) {
  mode.value = "edit";
  const row = props.rows[index];
  resourceToEdit.value = JSON.parse(JSON.stringify(row));
  editIndex.value = index;
}

async function deleteRow(index) {
  const result = confirm("Sei sicuro di voler cancellare questa riga?");

  if (result) {
    props.rows.splice(index, 1);
  }

  emit("row-deleted", props.rows);
}

function getPillBgColor(color) {
  if (!color) {
    return "bg-gray-500";
  }
  return color;
}

function onFormValid(value) {
  resourceToEditValid.value = value;
}

function onFormChange(value) {
  resourceToEdit.value = value || {};
}

if (proxy) {
  proxy.delete = deleteRow;
}
</script>

<style>
.select-circle {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: 1px solid var(--primary);
  transition: 0.2s ease-in-out;
}

.select-circle:hover {
  background-color: var(--primary);
}

.select-circle.selected {
  background-color: var(--primary);
}
</style>
