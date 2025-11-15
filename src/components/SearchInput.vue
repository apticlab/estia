<template>
  <div
    @click="focusInput()"
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
    <icon name="search" color="text-gray-300" size="m" class="mr-3"></icon>
    <input
      ref="input"
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
      v-on:keyup.enter="onEnter"
      v-model="inputValue"
      :focus="focus"
    />
    <span
      class="text-xs text-gray-400 cursor-pointer"
      v-show="inputValue"
      @click="clearInput()"
    >
      Cancella
    </span>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import _ from "lodash";

const props = defineProps({
  value: {
    type: String,
    required: false,
  },
  focus: {
    type: Boolean,
    required: false,
  },
  placeholder: {
    type: String,
    required: false,
    default: "Cerca",
  },
  mode: {
    type: String,
    required: false,
    default: "enter",
    validator: (mode) => {
      return ["enter", "debounce"].includes(mode);
    },
  },
});

const emit = defineEmits(['input']);

const inputValue = ref(null);
const input = ref(null);

const debounceInput = _.debounce(() => {
  emit("input", inputValue.value);
}, 350);

const onInput = () => {
  if (inputValue.value == "") {
    inputValue.value = null;
  }
  if (props.mode == "debounce") {
    debounceInput();
  }
};

const onEnter = () => {
  if (props.mode == "enter") {
    emit("input", inputValue.value);
  }
};

const clearInput = () => {
  inputValue.value = null;
  emit("input", inputValue.value);
};

const focusInput = () => {
  input.value.focus();
};

watch(() => props.focus, (newv) => {
  if (newv) {
    input.value.focus();
  } else {
    input.value.blur();
  }
});

onMounted(() => {
  inputValue.value = props.value;
});
</script>
