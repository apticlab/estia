<template>
  <div :data-type="context.type">
    <prism-editor :code="jsonData" language="js" @change="onJsonChange">
    </prism-editor>
  </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import PrismEditor from "vue-prism-editor";
import "prismjs";
import "prismjs/themes/prism.css";

export default {
  name: "resource-json",
  props: {
    context: {
      type: Object,
      required: true
    }
  },
  components: {
    PrismEditor
  },
  data() {
    return {
      options: {
        confirmText: "confirm",
        cancelText: "cancel"
      },
      jsonData: null
    };
  },
  beforeMount() {},
  mounted() {
    this.jsonData = this.context.model
      ? JSON.stringify(JSON.parse(this.context.model), null, 2)
      : "";
    this.log(this.jsonData);
  },
  methods: {
    onJsonChange(json) {
      this.log("on-json-change", json);
      this.jsonData = json;
      try {
        this.context.model = JSON.parse(this.jsonData);
      } catch (e) {
        this.log(e);
      }
    }
  },
  computed: {
    sel_config() {
      return this.header.select;
    },
    model() {
      return JSON.stringify(this.jsonData, null, "\t");
    },
    header() {
      return this.context.attributes.header;
    },
    attributes() {
      return this.context.attributes;
    }
  },
  watch: {}
};
</script>
