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
              <p>(massimo {{ maxFileSize }}MB)</p>
              <p class="mt-4 text-gray-600">
                Puoi anche caricare
                {{ files.length > 0 ? "altri" : "i" }} file
              </p>
              <a class="text-blue-600-500 hover:text-blue-600-600 underline"
                >cliccando qui</a
              >
            </div>
          </slot>
        </template>
        <div v-if="files.length > 0" class="w-full">
          <h2 class="text-gray-600 text-xl font-semibold">I tuoi file</h2>
          <div class="grid grid-cols-2 gap-3">
            <template v-for="(file, index) in files">
              <slot name="name" :file="file" :isLoading="isLoading">
                <div
                  :key="'file_' + index"
                  class="
                    grid grid-cols-7
                    items-center
                    p-2
                    rounded-lg
                    border-2 border-gray-200
                  "
                >
                  <div
                    :class="file.style.background"
                    class="
                      flex
                      items-center
                      justify-center
                      w-12
                      h-12
                      rounded-lg
                      col-span-2
                    "
                  >
                    <icon name="document" size="xl" :class="file.style.icon" />
                  </div>
                  <span
                    class="
                      text-black
                      font-semibold
                      line-break-anywhere
                      col-span-4
                    "
                    >{{ file.name }}</span
                  >
                  <button
                    @click.stop="removeFile(index)"
                    class="ml-auto mr-1 p-2 cursor-pointer col-span-1"
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
<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';

const props = defineProps({
  type: { required: false, default: "file" },
  maxFileSize: { required: false, default: 1 }, // in mb
  maxFiles: { required: false, default: 1 },
  extensions: {
    required: false,
    default() {
      return [];
    },
  },
});

const emit = defineEmits(['input']);

const instance = getCurrentInstance();
const log = instance.appContext.config.globalProperties.log || console.log;

const files = ref([]);
const isLoading = ref(false);
const dragActive = ref(false);
const dragAndDropCapable = ref(false);
const fileform = ref(null);
const hiddenInput = ref(null);

const sum = (prev, curr) => {
  return (prev += curr.size);
};

const removeFile = (index) => {
  files.value.splice(index, 1);
  emit('input', files.value);
};

const handleInputChange = (evt) => {
  let filesList = [];
  if (evt.dataTransfer) {
    filesList = evt.dataTransfer.files;
  } else {
    filesList = hiddenInput.value.files;
  }

  let filesSizeInMB = Array.from(filesList).reduce(sum, 0) / 1000000;
  let actualeSizeInMB = files.value.reduce(sum, 0) / 1000000;

  log(filesSizeInMB, actualeSizeInMB);

  if (actualeSizeInMB + filesSizeInMB > props.maxFileSize) {
    alert(
      "Il limite massimo per l'upload dei file è di " +
        props.maxFileSize +
        " MB"
    );
    return;
  }

  for (let i = 0; i < filesList.length; i++) {
    let length = files.value.length;
    files.value[length] = {
      name: filesList[i].name,
      style: getFileStyle(filesList[i].name),
      size: filesList[i].size,
      file: filesList[i],
    };
  }

  emit('input', files.value);
  files.value = [...files.value];
};

const openFileChooser = () => {
  hiddenInput.value.click();
};

const detectDragAndDropCapable = () => {
  var div = document.createElement("div");

  return (
    ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
    "FormData" in window &&
    "FileReader" in window
  );
};

const getFileStyle = (filename) => {
  let fileExtension = filename.split(".")[filename.split(".").length - 1];
  log(fileExtension);
  let style = {
    icon: "",
    background: "",
  };

  switch (fileExtension) {
    case "doc":
    case "docx":
    case "odt":
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      style.icon = "text-blue-600-200";
      style.background = "bg-blue-600-700";
      break;
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
      style.icon = "text-orange-200";
      style.background = "bg-orange-500";
      break;
    case "pdf":
      style.icon = "text-red-200";
      style.background = "bg-red-500";
      break;
    default:
      style.icon = "text-gray-200";
      style.background = "bg-gray-500";
      break;
  }
  return style;
};

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
      "drop",
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
<style>
.line-break-anywhere {
  line-break: anywhere;
}
</style>
