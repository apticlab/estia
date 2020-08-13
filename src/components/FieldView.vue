<template>
  <div>
    <div v-if="![undefined, null, ''].includes(value)">
      <span v-if="field.type == 'user' && !field.select.multi">
        {{
        value
        }}
      </span>
      <span v-if="field.type == 'user' && field.select.multi">
        <div v-for="customerData in value" class="text-gray-800 mb-2">{{ customerData.text }}</div>
      </span>
      <span v-if="field.type == 'text'">{{ value }}</span>
      <span v-if="field.type == 'textarea'">{{ value }}</span>
      <span v-if="field.type == 'select'">{{ value }}</span>

      <span v-if="field.type == 'balance'">{{ value | round }} €</span>
      <span v-if="field.type == 'date'">
        {{
        value | format(field.dateFormat)
        }}
      </span>
      <span v-if="field.type == 'number'">{{ value | round(2, field.udm) }} {{ field.udm }}</span>
      <span v-if="field.type == 'customer'">
        <span
          @click="goToCustomerDetail(field, data)"
          class="text-blue-700 hover:underline cursor-pointer"
        >{{ value }}</span>
      </span>
      <span v-if="field.type == 'email'">
        <a :href="'mailto:' + value" class="text-blue-700 hover:underline">
          {{
          value
          }}
        </a>
      </span>
      <span v-if="field.type == 'boolean'">
        <i v-if="value" class="text-green-700 fas fa-check"></i>
        <i v-else class="text-red-700 fas fa-times"></i>
      </span>
      <span v-if="field.type == 'image_upload'">
        <div
          class="rounded-full w-48 h-48 border-2 border-dashed border-gray bg-gray-light flex items-center justify-center text-xl"
          :style="value"
        ></div>
      </span>
      <span v-if="field.type == 'resource'">
        <resource-editor :resource="field.resource.name" :readonly="true" :values="value"></resource-editor>
      </span>
      <span v-if="field.type == 'fieldset'"></span>
      <span v-if="field.type == 'survey'">
        <resource-survey :context="{ model: value, type: 'survey' }" :readonly="field.readonly"></resource-survey>
      </span>
    </div>
    <div v-else>
      <span class="text-gray-400">Valore non impostato</span>
    </div>
  </div>
</template>
<script>
export default {
  name: "FieldView",
  props: {
    data: { required: true },
    field: { required: true },
  },
  components: {},
  data() {
    return {
      value: null,
      example:
        '{"status":200,"error":"","data":[{"news_id":51184,"title":"iPhone X Review: Innovative future with real black technology","source":"Netease phone"},{"news_id":51183,"title":"Traffic paradise: How to design streets for people and unmanned vehicles in the future?","source":"Netease smart","link":"http://netease.smart/traffic-paradise/1235"},{"news_id":51182,"title":"Teslamasks American Business Relations: The government does not pay billions to build factories","source":"AI Finance","members":["Daniel","Mike","John"]}]}',
    };
  },
  mounted() {
    let fieldName = this.getFieldNameFromType(this.field) || this.field.field;

    switch (this.field.type) {
      case "fieldset":
        this.value = this.field.label;
        break;
      case "image_upload":
        this.value = {
          "background-image":
            "url(" + this.deepPick(this.data, fieldName) + ")",
        };
        break;
      case "json":
        this.value =
          JSON.parse(JSON.stringify(this.deepPick(this.data, fieldName))) || "";
        break;
      default:
        this.value = this.deepPick(this.data, fieldName);
    }
  },
  methods: {
    getFieldNameFromType(field) {
      switch (field.type) {
        case "user":
          if (field.select.multi) {
            return field.field;
          }

          return field.field + ".text";
        case "select":
          return field.code + "." + field.select.option;
        default:
          return null;
      }
    },
  },
  computed: {},
};
</script>
