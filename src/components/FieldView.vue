<template>
  <div>
    <div v-if="![undefined, null, ''].includes(value)">
      <span v-if="field.type == 'user' && !field.select.multi">
        {{ value }}
      </span>
      <span v-if="field.type == 'user' && field.select.multi">
        <div v-for="customerData in value" class="mb-2 text-gray-800">
          {{ customerData.text }}
        </div>
      </span>
      <span v-if="field.type == 'text'">{{
        value ? value : field.on_empty
      }}</span>
      <span v-if="field.type == 'textarea'">{{ value }}</span>
      <span v-if="field.type == 'select'">{{ value }}</span>

      <span v-if="field.type == 'balance'">{{ value | round }} €</span>
      <span v-if="field.type == 'date'">
        {{ value | date(field.dateFormat) }}
      </span>
      <span v-if="field.type == 'number'"
        >{{ value | round(2, field.udm) }} {{ field.udm }}</span
      >
      <span v-if="field.type == 'customer'">
        <span
          @click="goToCustomerDetail(field, data)"
          class="text-blue-600-700 cursor-pointer hover:underline"
          >{{ value }}</span
        >
      </span>
      <span v-if="field.type == 'email'">
        <a :href="'mailto:' + value" class="text-blue-600-700 hover:underline">
          {{ value }}
        </a>
      </span>
      <span v-if="field.type == 'boolean'">
        <i v-if="value" class="text-green-700 fas fa-check"></i>
        <i v-else class="text-red-700 fas fa-times"></i>
      </span>
      <span v-if="field.type == 'image_upload'">
        <div
          class="
            flex
            items-center
            justify-center
            w-48
            h-48
            text-xl
            border-2 border-dashed
            rounded-full
            border-gray
            bg-gray-light
          "
          :style="value"
        ></div>
      </span>
      <span v-if="field.type == 'resource'">
        <resource-editor
          :resource="field.resource.name"
          :readonly="true"
          :values="value"
        ></resource-editor>
      </span>
      <span v-if="field.type == 'fieldset'"></span>
      <span v-if="field.type == 'choices'">
        <span>{{ value }}</span>
      </span>
      <div v-if="$viewFields[field.type]">
        <component
          :is="$viewFields[field.type]"
          :context="field.context"
          :field="deepPick(data, field.field)"
        ></component>
      </div>
    </div>
    <div v-else>
      <span class="text-gray-400">Valore non impostato</span>
    </div>
  </div>
</template>
<script setup>
import { computed, getCurrentInstance } from 'vue';

const props = defineProps({
  data: { required: true },
  field: { required: true },
});

const instance = getCurrentInstance();
const deepPick = instance?.appContext.config.globalProperties.deepPick;
const $viewFields = instance?.appContext.config.globalProperties.$viewFields;
const $filters = instance?.appContext.config.globalProperties.$filters;

const getFieldNameFromType = (field) => {
  switch (field.type) {
    case "user":
      if (field.select?.multi) {
        return field.field;
      }
      return field.field + ".text";
    case "select":
      return field.code + "." + field.select.option;
    default:
      return null;
  }
};

const value = computed(() => {
  let fieldName = getFieldNameFromType(props.field) || props.field.field;

  switch (props.field.type) {
    case "fieldset":
      return props.field.label;

    case "image_upload":
      return {
        "background-image":
          "url(" + deepPick?.(props.data, fieldName) + ")",
      };

    case "choices":
      let choice = props.field.choices?.find(
        (val) => deepPick?.(props.data, fieldName) == val.code
      );

      if (choice) {
        return choice.value;
      }

      return null;

    case "json":
      return JSON.parse(JSON.stringify(deepPick?.(props.data, fieldName) || ""));

    default:
      return deepPick?.(props.data, fieldName);
  }
});

const goToCustomerDetail = (field, data) => {
  // Implementation would be injected via global properties if needed
  const goToCustomerDetailFn = instance?.appContext.config.globalProperties.goToCustomerDetail;
  goToCustomerDetailFn?.(field, data);
};
</script>
