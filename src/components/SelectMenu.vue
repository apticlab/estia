<template>
  <div class="mt-1 relative">
    <button
      type="button"
      class="
        relative
        w-full
        bg-white
        border border-gray-300
        rounded-md
        shadow-sm
        pl-3
        pr-10
        py-2
        text-left
        focus:outline-none
        focus:ring-1
        focus:ring-seagreen-500
        focus:border-seagreen-500
        sm:text-sm
      "
      @click="showMenu()"
    >
      <span class="flex flex-row justify-center"> Azioni </span>
      <span
        class="
          ml-3
          absolute
          inset-y-0
          right-0
          flex
          items-center
          pr-2
          pointer-events-none
        "
      >
        <svg
          class="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>
    <div
      v-if="isMenuVisible"
      class="
        absolute
        z-10
        mt-1
        bg-white
        shadow-lg
        max-h-56
        rounded-md
        py-1
        text-base
        ring-1 ring-black ring-opacity-5
        overflow-auto
        focus:outline-none
        sm:text-sm
        left-[-100px]
      "
      tabindex="-1"
    >
      <div
        v-for="(action, i) in actions"
        :key="'action_' + i"
        class="text-gray-900 hover:bg-gray-50 cursor-pointer p-2 flex flex-row justify-start items-center w-full"
        @click="emitAction(action)"
      >
        <icon :name="action.icon" class="mr-2 mt-1 text-md" size="s" />
        <span>{{ action.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "select-menu",
  props: {
    actions: {
      default: null,
      required: true,
      type: Array,
    },
  },
  data() {
    return {
      isMenuVisible: false,
    };
  },
  methods: {
    showMenu() {
      this.isMenuVisible = !this.isMenuVisible;
    },
    emitAction(action) {
      this.$emit("act", action);
    },
  },
};
</script>

<style>
</style>