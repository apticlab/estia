<template>
  <div
    :class="{
      ['col-span-' + (header.colSpan || 12)]: true,
      ['row-span-' + (header.rowSpan || 1)]: true
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
          @input="timeObjectToString($event, header)"
          :minute-interval="5"
          format="HH:mm"
        >
        </vue-timepicker>
      </template>
      <template v-if="header.type == 'text'">
        <input
          type="text"
          :name="header.field"
          v-model="value[header.field]"
          class="form-control w-full"
        />
      </template>
      <template v-if="header.type == 'number'">
        <input
          type="number"
          v-model="value[header.field]"
          name="capital_amount"
          style="min-width: 1px"
          id="amount"
          class="form-control rounded-r-none flex-grow"
        />
      </template>
      <template v-if="header.type == 'amount'">
        <div class="flex">
          <input
            type="number"
            v-model="value[header.field]"
            :name="header.field"
            style="min-width: 1px"
            class="form-control rounded-r-none flex-grow"
          />
          <div
            class="bg-gray-200 rounded rounded-l-none border border-gray-300 flex items-center border-l-0"
          >
            <span class="text-gray-600 px-3">
              {{ header.udm || "€" }}
            </span>
          </div>
        </div>
      </template>
      <template v-if="header.type == 'date'">
        <input
          type="date"
          :value="formatDate(value[header.field])"
          @change="changeDate"
          :name="header.field"
          class="form-control rounded-r-none flex-grow"
        />
      </template>
      <template v-if="header.type == 'select'">
        <select
          v-model="value[header.field]"
          :name="header.field"
          class="form-control w-full"
        >
          <option :value="undefined">Scegli...</option>
          <option
            :value="option"
            :selected="
              value[header.field] ? value[header.field].id == option.id : false
            "
            :key="option.id"
            v-for="option in options"
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
          <i class="ml-6 fas fa-times text-red-600 cursor-pointer"></i>
        </span>
        <FormulateInput
          v-else
          style="max-height: 30px"
          class="w-full"
          type="file"
          v-model="document"
          :uploader="uploadFile"
        />
      </template>
      <template v-if="header.type == 'user'">
        <FormulateInput
          type="dynamic-select"
          :name="header.field"
          :header="header"
          :key="header.field"
          v-model="value[header.field]"
        />
      </template>
    </div>
  </div>
</template>
<script>
import { api } from "@/utils/api";

export default {
  name: "FieldEdit",
  props: {
    header: {},
    value: {}
  },
  data() {
    return {
      document: {},
      options: []
    };
  },
  mounted() {
    this.fetchOptions();
  },
  methods: {
    timeObjectToString(evt, header) {
      this.value[header.field] = evt.HH + ":" + evt.mm;
    },
    async fetchOptions() {
      if (this.header.type == "select" && this.header.select) {
        if (this.header.select.choices) {
          this.options = this.header.select.choices;
          return;
        }

        try {
          this.options = await api.params(this.header.select.url);
        } catch (err) {
          console.log(err);
        }
      }
    },
    formatDate(date) {
      if (!date) {
        return;
      }

      if (typeof date == "string") {
        return date.split(" ")[0];
      }

      return date.target.value;
    },
    changeDate(date) {
      this.value[this.header.field] = date.target.value;

      let value = _.clone(this.value);

      this.$emit("input", value);
    },
    uploadFile(f) {
      const reader = new FileReader();

      let file = this.document.files[0].file;

      reader.onload = e => {
        let value = _.clone(this.value);

        value[this.header.field] = {
          base64: btoa(reader.result),
          path: f.name,
          field: this.header.field,
          doc: {
            filename: f.name
          }
        };

        this.$emit("input", value);
      };

      reader.readAsBinaryString(file);
    },
    deleteFile(value, field) {
      this.document = null;
      this.value[field] = null;

      this.$forceUpdate();
    }
  },
  computed: {
    docIsPresent() {
      return !!this.value[this.header.field];
    },
    filename() {
      let file = this.value[this.header.field].doc;

      return file ? file.filename : "";
    }
  },
  watch: {
    async header(newVal, oldVal) {
      await this.fetchOptions();
    },
    value(newVal, oldVal) {
      if (this.header.type == "file") {
        this.document = null;
      }
    }
  }
};
</script>
