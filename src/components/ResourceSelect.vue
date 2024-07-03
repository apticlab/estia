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

<script>
import axios from "axios";
import _ from "lodash";

export default {
  name: "resource-select",
  props: {
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
  },
  data() {
    return {
      optionsArray: null,
    };
  },
  mounted() {},
  beforeMount() {},
  methods: {
    onChange($event) {
      let eventValue = $event.target.value;
      let newValue = this.options.find((o) => o.id == eventValue);

      this.log(this.code, eventValue, newValue);

      if (this.context) {
        if (this.select.project) {
          this.context.model = newValue[this.select.project];
        } else {
          this.context.model = newValue;
        }
      } else {
        this.$emit("change", newValue);
      }
    },
    onSearch(search, loading, param) {
      this.onSearchDebounced(search, loading, param, this);
    },
    async reloadOptions() {
      let url = this.select.url;
      if (this.select.of) {
        url = url.concat(`/${this.deepFind(this, header.select.of)}`);
      }

      let selectValues = [];

      if (this.select.type && this.select.type == "param") {
        selectValues = await this.$api.params(url);
      } else {
        selectValues = await this.$api.list(url);
      }

      this.optionsArray = selectValues;

      this.$forceUpdate();
    },
    addResource() {
      if (!this.select) {
        this.$alert.show({});

        return;
      }

      this.$dialog.show({
        type: "resource-edit",
        resource: this.select.code,
        onConfirm: async () => {
          await this.reloadOptions();
        },
      });
    },
  },
  computed: {
    options() {
      if (this.optionsArray == null) {
        return this.attributes.resources;
      }

      return this.optionsArray;
    },
    select() {
      return this.attributes.select;
    },
    code() {
      return this.select.option;
    },
    model() {
      if (this.context) {
        return this.context.model;
      }

      return this.value || {};
    },
    attributes() {
      if (this.context) {
        return this.context.attributes;
      }

      return {
        header: this.header,
        select: this.header.select,
        resources: this.resources,
        optionField: this.header.select.option,
        placeholder: this.header.placeholder,
      };
    },
    formattedOptions() {
      return this.options.map((opt) => {
        return {
          id: opt.id,
          text: this.deepPick(opt),
        };
      });
    },
  },
};
</script>
