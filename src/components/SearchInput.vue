<template>
  <div
    @click="focusInput"
    class="
      px-2
      h-11
      text-sm
      border border-gray-300
      rounded
      flex flex-row
      items-center
      bg-white
      cursor-text
    "
  >
    <Icon name="search" color="text-gray-300" size="m" class="mr-3" />
    <input
      ref="inputRef"
      class="
        m-0
        p-0
        bg-transparent
        border-none
        focus:outline-none
        active:outline-none
      "
      style="height: initial"
      type="text"
      :placeholder="placeholder"
      @input="onInput"
      @keyup.enter="onEnter"
      v-model="inputValue"
    />
    <span
      class="text-xs text-gray-400 cursor-pointer"
      v-show="inputValue"
      @click="clearInput"
    >
      Cancella
    </span>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import debounce from "lodash/debounce";
import Icon from "@/components/Icon.vue";

defineOptions({ name: "SearchInput" });

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
  focus: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "Cerca",
  },
  mode: {
    type: String,
    default: "enter",
    validator: (mode) => {
      return ["enter", "debounce"].includes(mode);
    },
  },
});

const emit = defineEmits(["update:modelValue", "input"]);

const inputValue = ref(props.modelValue ?? null);
const inputRef = ref(null);

const emitValue = () => {
  emit("update:modelValue", inputValue.value);
  emit("input", inputValue.value);
};

const debounceInput = debounce(emitValue, 350);

const onInput = () => {
  if (inputValue.value === "") {
    inputValue.value = null;
  }
  if (props.mode === "debounce") {
    debounceInput();
  }
};

const onEnter = () => {
  if (props.mode === "enter") {
    emitValue();
  }
};

const clearInput = () => {
  inputValue.value = null;
  emitValue();
};

const focusInput = () => {
  inputRef.value?.focus();
};

watch(
  () => props.focus,
  (newVal) => {
    if (newVal) {
      focusInput();
    } else {
      inputRef.value?.blur();
    }
  }
);

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== inputValue.value) {
      inputValue.value = newValue ?? null;
    }
  }
);

onBeforeUnmount(() => {
  debounceInput.cancel();
});
</script>
