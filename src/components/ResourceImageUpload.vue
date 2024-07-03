<template>
  <div :data-type="context.type" v-if="model">
    <label>
      <div class="flex flex-col flex-grow" @drop.prevent="addImageOnDrop" @dragover.prevent>
        <input type="file" name="file-input" @change="addImage" ref="file_input" hidden />
        <div class="flex-1 flex flex-col items-center justify-center cursor-pointer">
          <div
            class="rounded-full w-48 h-48 border border-gray bg-gray-light flex items-center justify-center text-xl"
          >
            <i class="ti-image text-gray"></i>
          </div>
        </div>
        <div class="text-blue-600 flex flex-row items-center justify-center mt-5 cursor-pointer">
          <i class="ti-upload mr-2"></i>
          Carica immagine
        </div>
      </div>
    </label>
  </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";

export default {
  name: "resource-image-upload",
  props: {
    context: {
      type: Object,
      required: true
    }
  },
  data() {
    return {};
  },
  beforeMount() {},
  mounted() {},
  methods: {
    triggerFileChooser() {
      this.log(this.$refs.file_input);
      this.$refs.file_input.click();
    },
    addImageOnDrop(e) {
      let droppedFiles = e.dataTransfer.files;
      if (!droppedFiles) return;
      [...droppedFiles].forEach(f => {
        this.context.model = f;
      });
    },
    addImage(e) {
      let files = e.target.files;
      if (!files) return;
      [...files].forEach(f => {
        this.context.model = f;
      });
    }
  },
  computed: {
    model() {
      return this.context.model;
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
