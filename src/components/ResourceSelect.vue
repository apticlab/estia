<template>
  <div :data-type="context.type">
    <div
      v-if="select.can_add"
      class="flex flex-row items-baseline max-w-screen-xl absolute right-0 top-0"
    >
      <div
        @click="addResource()"
        class="text-blue ml-auto flex flex-row items-center cursor-pointer hover:text-blue-dark font-bold"
      >
        <i class="ti-plus mr-2"></i>
        <span>Aggiungi</span>
      </div>
    </div>
    <select
      v-if="options"
      @change="onChange"
      :name="context.name"
      class="form-control flex-grow w-full"
    >
      <option value="undefined">{{ attributes.placeholder }}</option>
      <option
        :key="option.id"
        v-for="option in options"
        :selected="option.id == context.model.id || option.id == context.model"
        :value="option.id"
      >
        {{
          attributes.optionField
            ? deepPick(option, attributes.optionField)
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
      required: true
    }
  },
  data() {
    return {
      optionsArray: null
    };
  },
  beforeMount() {},
  methods: {
    onChange($event) {
      this.context.model = this.options.find(o => o.id == $event.target.value);
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
        }
      });
    }
  },
  computed: {
    options() {
      if (this.optionsArray == null) {
        return this.context.attributes.resources;
      }

      return this.optionsArray;
    },
    select() {
      return this.attributes.select;
    },
    model() {
      return this.context.model;
    },
    header() {
      return this.attributes.header;
    },
    attributes() {
      return this.context.attributes;
    },
    formattedOptions() {
      return this.options.map(opt => {
        return {
          id: opt.id,
          text: this.deepPick(opt)
        };
      });
    }
  }
};
</script>
