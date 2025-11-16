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

<script setup>
import { ref, computed, getCurrentInstance } from 'vue';

const props = defineProps({
  context: {
    type: Object,
    required: true
  }
});

const instance = getCurrentInstance();
const log = instance?.appContext.config.globalProperties.log;

const file_input = ref(null);

const model = computed(() => {
  return props.context.model;
});

const header = computed(() => {
  return props.context.attributes.header;
});

const attributes = computed(() => {
  return props.context.attributes;
});

const triggerFileChooser = () => {
  log?.(file_input.value);
  file_input.value?.click();
};

const addImageOnDrop = (e) => {
  let droppedFiles = e.dataTransfer.files;
  if (!droppedFiles) return;
  [...droppedFiles].forEach(f => {
    props.context.model = f;
  });
};

const addImage = (e) => {
  let files = e.target.files;
  if (!files) return;
  [...files].forEach(f => {
    props.context.model = f;
  });
};
</script>
