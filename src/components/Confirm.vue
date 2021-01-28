<template>
  <div class="flex flex-col w-1/4 bg-white rounded shadow-xl">
    <div class="flex-grow p-6 py-4">
      <h3 class="mb-5 text-xl font-bold text-green-600">{{ params.title }}</h3>
      <p class="mb-3">
        {{ params.text }}
      </p>
    </div>
    <div class="flex flex-row p-4 bg-gray-200">
      <div class="ml-auto">
        <button @click="confirm(false)">
          {{ params.dismissText }}
        </button>
        <button
          @click="confirm(true)"
          class="px-3 py-2 ml-3 text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {{ params.confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Confirm",
  props: {
    params: {
      required: true,
      type: Object,
      default() {
        return {
          title: "Titolo",
          text: "Testo"
        };
      }
    }
  },
  data() {
    return {
      chosenFolder: null
    };
  },
  async mounted() {},
  methods: {
    confirm(result) {
      this.$emit("done", result);
    }
  },
  computed: {}
};
</script>
