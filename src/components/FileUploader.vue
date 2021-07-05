<template>
  <div>
    <p class="text-lg">
      Trascina e rilascia
      <span v-if="type == 'image'">un'immagine</span>
      <span v-if="type == 'file'">un file</span>
      nell'area grigia.
      <br />
      Oppure clicca al suo interno per caricare direttamente
      <span v-if="type == 'image'">un'immagine</span>
      <span v-if="type == 'file'">un file</span>
      .
    </p>
    <div class="flex items-center justify-center">
      <div
        ref="fileform"
        v-on:click="openFileChooser()"
        class="mt-8 flex items-center justify-center text-lg h-56 w-full rounded border-2 border-dashed border-gray-light cursor-pointer"
        :class="{ 'drag-active': dragActive }"
      >
        <span class="drop-files text-gray-light" v-if="!isLoading && !file">
          Trascina qui i file o clicca
        </span>
        <span v-if="file && !isLoading">
          <div class="flex items-center justify-center">
            <i class="ti-file mr-2"></i>
            Stai caricando il file <br />
            {{ file.name }}
          </div>
        </span>
        <span v-if="isLoading">
          Caricamento...
        </span>
      </div>
      <input
        type="file"
        :accept="extensions.join(',')"
        style="display:none"
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
      }
    }
  },
  data() {
    return {
      image: "",
      file: "",
      fileSrc: "",
      isLoading: false,
      dragActive: false,
      dragAndDropCapable: false
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
    handleInputChange: function(evt) {
      if (evt.dataTransfer) {
        this.file = evt.dataTransfer.files[0];
      } else {
        this.file = this.$refs.hiddenInput.files[0];
      }

      this.isLoading = true;
      this.dragActive = false;

      var reader = new FileReader();

      reader.addEventListener(
        "load",
        function() {
          this.fileSrc = reader.result;
          this.isLoading = false;

          console.log(this.file);
          this.$emit("input", this.file);

          this.$forceUpdate();
        }.bind(this),
        false
      );

      reader.readAsDataURL(this.file);
    },
    openFileChooser: function() {
      this.$refs.hiddenInput.click();
    },
    detectDragAndDropCapable: function() {
      var div = document.createElement("div");

      return (
        ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
        "FormData" in window &&
        "FileReader" in window
      );
    }
  },
  computed: {
    backgroundStyle() {
      var borderRadius = this.type == "image" ? "50%" : "15px";
      var backgroundImage =
        this.type == "image" ? "url(" + this.imageSrc + ")" : "none";
      var height = this.type == "image" ? "300px" : "300px";
      var width = this.type == "image" ? "300px" : "450px";

      return {
        "border-radius": borderRadius,
        "background-image": backgroundImage,
        height: height,
        width: width
      };
    }
  }
};
</script>
