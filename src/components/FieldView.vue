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
          class="text-blue-700 cursor-pointer hover:underline"
          >{{ value }}</span
        >
      </span>
      <span v-if="field.type == 'email'">
        <a :href="'mailto:' + value" class="text-blue-700 hover:underline">
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
      example:
        '{"status":200,"error":"","data":[{"news_id":51184,"title":"iPhone X Review: Innovative future with real black technology","source":"Netease phone"},{"news_id":51183,"title":"Traffic paradise: How to design streets for people and unmanned vehicles in the future?","source":"Netease smart","link":"http://netease.smart/traffic-paradise/1235"},{"news_id":51182,"title":"Teslamasks American Business Relations: The government does not pay billions to build factories","source":"AI Finance","members":["Daniel","Mike","John"]}]}',
    };
  },
  mounted() {},
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
  computed: {
    value() {
      let fieldName = this.getFieldNameFromType(this.field) || this.field.field;

      switch (this.field.type) {
        case "fieldset":
          return this.field.label;

        case "image_upload":
          return {
            "background-image":
              "url(" + this.deepPick(this.data, fieldName) + ")",
          };

        case "choices":
          let choice = this.field.choices.find(
            (val) => this.deepPick(this.data, fieldName) == val.code
          );

          if (choice) {
            return choice.value;
          }

          return null;

        case "json":
          return;
          JSON.parse(JSON.stringify(this.deepPick(this.data, fieldName))) || "";

        default:
          return this.deepPick(this.data, fieldName);
      }
    },
  },
};
</script>
