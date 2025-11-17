<template>
  <div :data-type="context ? context.type : ''">
    <div
      v-if="select.can_add"
      class="
        absolute
        top-0
        right-0
        flex flex-row
        items-baseline
        max-w-screen-xl
      "
    >
      <div
        @click="addResource()"
        class="
          flex flex-row
          items-center
          ml-auto
          font-bold
          cursor-pointer
          text-blue-600
          hover:text-blue-600-dark
        "
      >
        <i class="mr-2 ti-plus"></i>
        <span>Aggiungi</span>
      </div>
    </div>
    <select
      v-if="options"
      @change="onChange"
      :name="context ? context.name : ''"
      class="flex-grow w-full form-control"
    >
      <option value="undefined">{{ attributes.placeholder }}</option>
      <option
        :key="option.id"
        v-for="option in options"
        :selected="option.id == model.id || option.id == model"
        :value="option.id"
      >
        {{
          attributes.select.option
            ? deepPick(option, attributes.select.option)
            : option.description
        }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue';

const props = defineProps({
  context: {
    type: Object,
    required: false,
  },
  value: {
    required: false,
  },
  resources: {
    required: false,
  },
  header: {
    required: false,
  },
});

const emit = defineEmits(['change']);

const instance = getCurrentInstance();
const $api = instance.appContext.config.globalProperties.$api;
const $alert = instance.appContext.config.globalProperties.$alert;
const $dialog = instance.appContext.config.globalProperties.$dialog;
const deepFind = instance.appContext.config.globalProperties.deepFind;
const deepPick = instance.appContext.config.globalProperties.deepPick;
const log = instance.appContext.config.globalProperties.log;

const optionsArray = ref(null);

const attributes = computed(() => {
  if (props.context) {
    return props.context.attributes;
  }

  return {
    header: props.header,
    select: props.header.select,
    resources: props.resources,
    optionField: props.header.select.option,
    placeholder: props.header.placeholder,
  };
});

const options = computed(() => {
  if (optionsArray.value == null) {
    return attributes.value.resources;
  }

  return optionsArray.value;
});

const select = computed(() => {
  return attributes.value.select;
});

const code = computed(() => {
  return select.value.option;
});

const model = computed(() => {
  if (props.context) {
    return props.context.model;
  }

  return props.value || {};
});

const formattedOptions = computed(() => {
  return options.value.map((opt) => {
    return {
      id: opt.id,
      text: deepPick(opt),
    };
  });
});

const onChange = ($event) => {
  let eventValue = $event.target.value;
  let newValue = options.value.find((o) => o.id == eventValue);

  log(code.value, eventValue, newValue);

  if (props.context) {
    if (select.value.project) {
      props.context.model = newValue[select.value.project];
    } else {
      props.context.model = newValue;
    }
  } else {
    emit("change", newValue);
  }
};

const reloadOptions = async () => {
  let url = select.value.url;
  if (select.value.of) {
    url = url.concat(`/${deepFind(this, props.header.select.of)}`);
  }

  let selectValues = [];

  if (select.value.type && select.value.type == "param") {
    selectValues = await $api.params(url);
  } else {
    selectValues = await $api.list(url);
  }

  optionsArray.value = selectValues;
};

const addResource = () => {
  if (!select.value) {
    $alert.show({});
    return;
  }

  $dialog.show({
    type: "resource-edit",
    resource: select.value.code,
    onConfirm: async () => {
      await reloadOptions();
    },
  });
};
</script>
