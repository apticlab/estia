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
      class="text-blue-600 flex flex-row items-center justify-center mt-5 cursor-pointer"
      v-on:click="handleImageUpload()"
    >
      <i class="ti-upload mr-2"></i>
      Carica immagine
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  context: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['input']);

const extensions = ref(".png,.jpeg,.jpg,.gif");
const imageLoading = ref(false);
const dragActive = ref(false);
const dragAndDropCapable = ref(false);
const imageSrc = ref(null);
const isImage = ref(false);
const image = ref("");
const fileform = ref(null);
const hiddenInput = ref(null);

const backgroundStyle = computed(() => {
  let imageUrl = "";

  if (model.value) {
    imageUrl = model.value;
    isImage.value = true;
  }

  if (props.context.value) {
    imageUrl = "/avatars/" + props.context.value;
    imageLoading.value = false;
    isImage.value = true;
  }

  if (imageSrc.value) {
    imageUrl = imageSrc.value;
    isImage.value = true;
  }

  return {
    "background-image": "url(" + imageUrl + ")"
  };
});

const model = computed(() => {
  return props.context.model;
});

const header = computed(() => {
  return props.context.attributes.header;
});

const attributes = computed(() => {
  return props.context.attributes;
});

const showUploadedImage = () => {
  handleInputChange();
};

const detectDragAndDropCapable = () => {
  var div = document.createElement("div");

  return (
    ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
    "FormData" in window &&
    "FileReader" in window
  );
};

const handleImageUpload = () => {
  hiddenInput.value.click();
};

const previewImage = () => {
  imageSrc.value = model.value || "";
  imageLoading.value = true;
  dragActive.value = false;

  var reader = new FileReader();

  reader.addEventListener(
    "load",
    () => {
      imageSrc.value = reader.result;
      imageLoading.value = false;

      emit("input", image.value);
    },
    false
  );

  reader.readAsDataURL(image.value);
};

const handleInputChange = (evt) => {
  // Check if file is OK
  image.value = null;

  let file;

  if (evt && evt.dataTransfer) {
    file = evt.dataTransfer.files[0];
  } else {
    file = hiddenInput.value.files[0];
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
      const mimeTypes = extensions.value
        .replace(/\./g, "")
        .replace(/ /g, "")
        .split(",");

      if (mimeTypes.indexOf(fileMIMEType) != -1) {
        image.value = file;
        previewImage();
      }
    }
  };

  fileReader.readAsArrayBuffer(magicNumbers);
};

watch(imageSrc, (n, o) => {
  props.context.model = n;
});

onMounted(() => {
  dragAndDropCapable.value = detectDragAndDropCapable();

  if (dragAndDropCapable.value) {
    [
      "drag",
      "dragstart",
      "dragend",
      "dragover",
      "dragenter",
      "dragleave",
      "drop"
    ].forEach((evt) => {
      fileform.value.addEventListener(
        evt,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        false
      );
    });

    fileform.value.addEventListener("dragenter", () => {
      dragActive.value = true;
    });

    fileform.value.addEventListener("dragleave", () => {
      dragActive.value = false;
    });

    fileform.value.addEventListener("drop", (e) => {
      // Take only last file
      handleInputChange(e);
    });
  }
});
</script>
<style></style>
