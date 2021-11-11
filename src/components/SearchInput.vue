<template>
  <div>
    <div
      @click="focusInput()"
      class="px-2 h-11 text-sm border border-gray-300 rounded flex flex-row items-center bg-white cursor-text"
    >
      <icon name="search" color="text-gray-300" size="m" class="mr-3"></icon>
      <input
        ref="input"
        class="m-0 p-0 bg-transparent border-none focus:outline-none active:outline-none"
        style="height: initial"
        type="text"
        :placeholder="placeholder"
        @input="onInput"
        v-on:keyup.enter="onEnter"
        v-model="inputValue"
      />
      <span
        class="text-xs text-gray-400 cursor-pointer"
        v-show="inputValue"
        @click="clearInput()"
      >
        Cancella
      </span>
    </div>
  </div>
</template>
<script>
import _ from "lodash";

export default {
  name: "SearchInput",
  props: {
    value: {
      type: String,
      required: false
    },
    placeholder: {
      type: String,
      required: false,
      default: "Cerca"
    },
    mode: {
      type: String,
      required: false,
      default: "enter",
      validator: mode => {
        return ["enter", "debounce"].includes(mode);
      }
    }
  },
  data() {
    return {
      inputValue: null
    };
  },
  async mounted() {
    this.inputValue = this.value;
  },
  methods: {
    onInput(value) {
      if (this.mode == "debounce" && this.inputValue) {
        this.debounceInput(this.debounce);
      }
    },
    onEnter() {
      if (this.mode == "enter" && this.inputValue) {
        this.$emit("input", this.inputValue);
      }
    },
    debounceInput: _.debounce(function() {
      this.$emit("input", this.inputValue);
    }, 350),
    clearInput() {
      this.inputValue = null;
      this.$emit("input", this.inputValue);
    },
    focusInput() {
      this.$refs.input.focus();
    }
  },
  computed: {}
};
</script>
