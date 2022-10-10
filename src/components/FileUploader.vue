<template>
  <div>
    <div class="flex flex-row items-center">
      <div
        class="
          bg-gray-100
          p-4
          flex flex-row
          items-center
          justify-center
          mr-4
          rounded-full
        "
      >
        <icon name="folder-outline" size="xl" class="text-green-600" />
      </div>
      <h2 class="text-green-600 text-2xl font-semibold">Caricamento file</h2>
    </div>
    <div class="flex items-center justify-center">
      <div
        ref="fileform"
        v-on:click="openFileChooser()"
        class="
          my-5
          p-4
          flex flex-col
          items-center
          justify-center
          text-lg
          w-full
          rounded-md
          border-4 border-dashed border-gray-400
          cursor-pointer
        "
        :class="{ 'drag-active': dragActive }"
      >
        <template>
          <slot name="legend" :files="files" :isLoading="isLoading">
            <div
              class="
                mb-6
                p-4
                flex flex-row
                items-center
                justify-center
                rounded-full
              "
            >
              <icon
                name="cloud-upload-outline"
                size="3xl"
                class="text-gray-500"
              />
            </div>
            <div
              class="
                drop-files
                text-gray-light
                flex flex-col
                justify-center
                items-center
              "
              v-if="!isLoading"
            >
              <div
                class="
                  flex flex-row
                  gap-x-4
                  text-gray-800
                  font-semibold
                  text-lg
                "
              >
                <span>.PDF</span>
                <span>.PNG</span>
                <span>.JPG</span>
                <span>.DOC</span>
              </div>
              <p class="mt-4 text-gray-600">
                Puoi anche caricare
                {{ fileList.length > 0 ? "altri" : "i" }}file
              </p>
              <a class="text-blue-500 hover:text-blue-600 underline"
                >cliccando qui</a
              >
            </div>
          </slot>
        </template>
        <div v-if="fileList.length > 0" class="w-full">
          <h2 class="text-gray-600 text-xl font-semibold">I tuoi file</h2>
          <div class="grid grid-cols-2 gap-3">
            <template v-for="(file, index) in fileList">
              <slot name="name" :file="file" :isLoading="isLoading">
                <div
                  :key="'file_' + index"
                  class="
                    flex flex-row
                    items-center
                    p-2
                    rounded-lg
                    border-2 border-gray-200
                  "
                >
                  <div
                    class="
                      bg-orange-200
                      flex
                      items-center
                      justify-center
                      w-12
                      h-12
                      rounded-lg
                      mr-4
                    "
                  >
                    <icon name="document" size="l" class="text-orange-700" />
                  </div>
                  <span class="text-black font-semibold">{{ file.name }}</span>
                  <button
                    @click.stop="removeFile(index)"
                    class="ml-auto mr-1 p-2 cursor-pointer"
                  >
                    <icon
                      name="x-outline"
                      size="m"
                      class="text-gray-400"
                    ></icon>
                  </button>
                </div>
              </slot>
            </template>
          </div>
        </div>
      </div>
      <input
        multiple
        type="file"
        :accept="extensions.join(',')"
        style="display: none"
        v-on:change="handleInputChange($event)"
        ref="hiddenInput"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: "FileUploader",
  props: {
    type: { required: false, default: "file" },
    extensions: {
      required: false,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      fileList: [],
      files: [],
      isLoading: false,
      dragActive: false,
      dragAndDropCapable: false,
    };
  },
  mounted() {
    this.dragAndDropCapable = this.detectDragAndDropCapable();

    if (this.dragAndDropCapable) {
      [
        "drag",
        "dragstart",
        "dragend",
        "dragover",
        "dragenter",
        "dragleave",
        "drop",
      ].forEach(
        function (evt) {
          this.$refs.fileform.addEventListener(
            evt,
            function (e) {
              e.preventDefault();
              e.stopPropagation();
            }.bind(this),
            false
          );
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "dragenter",
        function () {
          this.dragActive = true;
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "dragleave",
        function () {
          this.dragActive = false;
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "drop",
        function (e) {
          // Take only last file
          this.handleInputChange(e);
        }.bind(this)
      );
    }
  },
  methods: {
    removeFile(index) {
      this.fileList.splice(index, 1);
    },
    handleInputChange: function (evt) {
      if (evt.dataTransfer) {
        this.fileList.push(...evt.dataTransfer.files);
      } else {
        this.fileList.push(...this.$refs.hiddenInput.files);
      }

      for (let i = 0; i < this.fileList.length; i++) {
        this.files[i] = this.fileList[i].name;
      }

      this.$emit("input", this.fileList);
    },
    openFileChooser: function () {
      this.$refs.hiddenInput.click();
    },
    detectDragAndDropCapable: function () {
      var div = document.createElement("div");

      return (
        ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
        "FormData" in window &&
        "FileReader" in window
      );
    },
  },
  computed: {},
};
</script>
