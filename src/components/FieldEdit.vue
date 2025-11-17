<template>
  <div
    :class="{
      ['col-span-' + (header.colSpan || 12)]: true,
      ['row-span-' + (header.rowSpan || 1)]: true,
    }"
  >
    <div class="flex flex-col">
      <label
        :for="header.field"
        class="font-semibold text-sm text-gray-600 mb-3"
      >
        {{ header.label }}
        <span
          v-if="header.validator && header.validator.indexOf('required') != -1"
          class="font-bold text-orange-600"
        >
          *
        </span>
      </label>
      <template v-if="header.type == 'time'">
        <vue-timepicker
          :name="header.field"
          :minute-interval="5"
          format="HH:mm"
          @input="timeObjectToString($event, header)"
        />
      </template>
      <template v-if="header.type == 'text'">
        <input
          v-model="value[header.field]"
          type="text"
          :name="header.field"
          class="form-control w-full"
        >
      </template>
      <template v-if="header.type == 'number'">
        <input
          id="amount"
          v-model="value[header.field]"
          type="number"
          name="capital_amount"
          style="min-width: 1px"
          class="form-control rounded-r-none flex-grow"
        >
      </template>
      <template v-if="header.type == 'amount'">
        <div class="flex">
          <input
            v-model="value[header.field]"
            type="number"
            :name="header.field"
            style="min-width: 1px"
            class="form-control rounded-r-none flex-grow"
          >
          <div
            class="bg-gray-200 rounded rounded-l-none border border-gray-300 flex items-center border-l-0"
          >
            <span class="text-gray-600 px-3">
              {{ header.udm || '€' }}
            </span>
          </div>
        </div>
      </template>
      <template v-if="header.type == 'date'">
        <input
          type="date"
          :value="formatDate(value[header.field])"
          :name="header.field"
          class="form-control rounded-r-none flex-grow"
          @change="changeDate"
        >
      </template>
      <template v-if="header.type == 'select'">
        <select
          v-model="value[header.field]"
          :name="header.field"
          class="form-control w-full"
        >
          <option :value="undefined">
            Scegli...
          </option>
          <option
            v-for="option in options"
            :key="option.id"
            :value="option"
            :selected="
              value[header.field] ? value[header.field].id == option.id : false
            "
          >
            {{
              header.select.option
                ? deepPick(option, header.select.option)
                : option.description
            }}
          </option>
        </select>
      </template>
      <template v-if="header.type == 'file'">
        <span
          v-if="docIsPresent"
          class="flex flex-row items-center py-2"
          @click="deleteFile(value, header.field)"
        >
          {{ filename }}
          <i class="ml-6 fas fa-times text-red-600 cursor-pointer" />
        </span>
        <FormulateInput
          v-else
          v-model="document"
          style="max-height: 30px"
          class="w-full"
          type="file"
          :uploader="uploadFile"
        />
      </template>
      <template v-if="header.type == 'user'">
        <FormulateInput
          :key="header.field"
          v-model="value[header.field]"
          type="dynamic-select"
          :name="header.field"
          :header="header"
        />
      </template>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue';
import _ from 'lodash';

const props = defineProps({
  header: {},
  value: {}
});

const emit = defineEmits(['input']);

const instance = getCurrentInstance();
const $api = instance.appContext.config.globalProperties.$api;
const deepPick = instance.appContext.config.globalProperties.deepPick;

const document = ref({});
const options = ref([]);

const docIsPresent = computed(() => {
  return !!props.value[props.header.field];
});

const filename = computed(() => {
  let file = props.value[props.header.field].doc;
  return file ? file.filename : '';
});

const timeObjectToString = (evt, header) => {
  props.value[header.field] = evt.HH + ':' + evt.mm;
};

const fetchOptions = async () => {
  if (props.header.type == 'select' && props.header.select) {
    if (props.header.select.choices) {
      options.value = props.header.select.choices;
      return;
    }

    try {
      options.value = await $api.params(props.header.select.url);
    } catch (err) {
      console.log(err);
    }
  }
};

const formatDate = (date) => {
  if (!date) {
    return;
  }

  if (typeof date === 'string') {
    return date.split(' ')[0];
  }

  return date.target.value;
};

const changeDate = (date) => {
  props.value[props.header.field] = date.target.value;

  let value = _.clone(props.value);

  emit('input', value);
};

const uploadFile = (f) => {
  const reader = new FileReader();

  let file = document.value.files[0].file;

  reader.onload = (e) => {
    let value = _.clone(props.value);

    value[props.header.field] = {
      base64: btoa(reader.result),
      path: f.name,
      field: props.header.field,
      doc: {
        filename: f.name
      }
    };

    emit('input', value);
  };

  reader.readAsBinaryString(file);
};

const deleteFile = (value, field) => {
  document.value = null;
  props.value[field] = null;
};

watch(() => props.header, async (newVal, oldVal) => {
  await fetchOptions();
});

watch(() => props.value, (newVal, oldVal) => {
  if (props.header.type == 'file') {
    document.value = null;
  }
});

onMounted(() => {
  fetchOptions();
});
</script>
