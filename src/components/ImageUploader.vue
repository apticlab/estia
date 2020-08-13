<template>
  <div :data-type="context.type" class="flex flex-col flex-grow items-center">
    <div
      ref="fileform"
      v-on:click="handleImageUpload()"
      class="rounded-full w-48 h-48 border-2 border-dashed bg-gray-light flex items-center justify-center text-xl"
      :class="dragActive ? 'border-green-600 bg-green-300' : 'border-gray'"
      :style="!dragActive ? backgroundStyle : ''"
    >
      <i
        class="ti-image text-xl sm:text-3xl"
        :class="dragActive ? 'text-green-600' : 'text-gray'"
        v-if="(!imageLoading && !isImage) || dragActive"
      ></i>
    </div>
    <input
      type="file"
      accept="image/*"
      style="display:none"
      v-on:change="showUploadedImage($event)"
      ref="hiddenInput"
    />
    <div
      class="text-blue flex flex-row items-center justify-center mt-5 cursor-pointer"
      v-on:click="handleImageUpload()"
    >
      <i class="ti-upload mr-2"></i>
      Carica immagine
    </div>
  </div>
</template>

<script>
export default {
  name: "resource-image-upload",
  props: {
    context: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      extensions: ".png,.jpeg,.jpg,.gif",
      imageLoading: false,
      dragActive: false,
      dragAndDropCapable: false,
      imageSrc: null,
      isImage: false,
      image: ""
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
        "drop"
      ].forEach(
        function(evt) {
          this.$refs.fileform.addEventListener(
            evt,
            function(e) {
              e.preventDefault();
              e.stopPropagation();
            }.bind(this),
            false
          );
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "dragenter",
        function() {
          this.dragActive = true;
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "dragleave",
        function() {
          this.dragActive = false;
        }.bind(this)
      );

      this.$refs.fileform.addEventListener(
        "drop",
        function(e) {
          // Take only last file
          this.handleInputChange(e);
        }.bind(this)
      );
    }
  },
  methods: {
    showUploadedImage: function() {
      this.handleInputChange();
    },
    detectDragAndDropCapable: function() {
      var div = document.createElement("div");

      return (
        ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
        "FormData" in window &&
        "FileReader" in window
      );
    },
    handleImageUpload: function() {
      this.$refs.hiddenInput.click();
    },
    previewImage: function() {
      this.imageSrc = this.model || "";
      this.imageLoading = true;
      this.dragActive = false;

      var reader = new FileReader();

      reader.addEventListener(
        "load",
        function() {
          this.imageSrc = reader.result;
          this.imageLoading = false;

          this.$emit("input", this.image);
        }.bind(this),
        false
      );

      reader.readAsDataURL(this.image);
    },
    handleInputChange: function(evt) {
      // Check if file is OK
      this.image = null;

      let file;

      if (evt && evt.dataTransfer) {
        file = evt.dataTransfer.files[0];
      } else {
        file = this.$refs.hiddenInput.files[0];
      }

      const fileReader = new FileReader();
      const magicNumbers = file.slice(0, 4);

      function getMIMEType(magicNumberSignature) {
        switch (magicNumberSignature) {
          case "89504E47":
            return "png";

          case "47494638":
            return "gif";

          case "25504446":
            return "pdf";

          case "FFD8FFDB":
          case "FFD8FFE0":
            return "jpeg";

          case "504B0506":
          case "504B0708":
          case "504B0304":
            return "xlsx";

          default:
            return "";
        }
      }

      fileReader.onloadend = e => {
        if (e.target.readyState === FileReader.DONE) {
          const uint = new Uint8Array(e.target.result);

          let bytes = [];

          uint.forEach(byte => {
            let padded16bitInt = ("0" + byte.toString(16)).slice(-2);

            bytes.push(padded16bitInt);
          });

          const hex = bytes.join("").toUpperCase();

          const fileMIMEType = getMIMEType(hex);
          const mimeTypes = this.extensions
            .replace(/\./g, "")
            .replace(/ /g, "")
            .split(",");

          if (mimeTypes.indexOf(fileMIMEType) != -1) {
            this.image = file;
            this.previewImage();
          }
        }
      };

      fileReader.readAsArrayBuffer(magicNumbers);
    }
  },
  computed: {
    backgroundStyle() {
      let imageUrl = "";

      if (this.model) {
        imageUrl = this.model;
        this.isImage = true;
      }

      if (this.value) {
        imageUrl = "/avatars/" + this.value;
        this.imageLoading = false;
        this.isImage = true;
      }

      if (this.imageSrc) {
        imageUrl = this.imageSrc;
        this.isImage = true;
      }

      return {
        "background-image": "url(" + imageUrl + ")"
      };
    },
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
  watch: {
    imageSrc(n, o) {
      this.context.model = n;
    }
  }
};
</script>
<style></style>
