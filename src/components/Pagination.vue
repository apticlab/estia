<template>
  <div v-if="visible" class="flex flex-row justify-between items-center">
    <p class="mb-0 p-helper">
      Risultati da <strong>{{ from }}</strong> a <strong>{{ to }}</strong> di <strong>{{ totalItems }}</strong></p>
    <div class="pagination">
      <button class="pagination-item" type="button" @click="onClickFirstPage" :disabled="isInFirstPage"
        :class="{ 'cursor-default': isInFirstPage }" aria-label="Go to first page">
        Inizio
      </button>

      <button class="pagination-item" type="button" @click="onClickPreviousPage" :disabled="isInFirstPage"
        :class="{ 'cursor-default': isInFirstPage }" aria-label="Go to previous page">
        <icon name="chevron-left-outline" size="s" />
      </button>

      <button :key="'paginiation_' + index" v-for="(page, index) in pages" class="pagination-item" type="button"
        @click="onClickPage(page.name)" :disabled="page.isDisabled" :class="{
          active: isPageActive(page.name),
          'cursor-default': page.isDisabled,
        }" :aria-label="`Go to page number ${page.name}`">
        {{ page.name }}
      </button>

      <button class="pagination-item" type="button" @click="onClickNextPage" :disabled="isInLastPage"
        :class="{ 'cursor-default': isInLastPage }" aria-label="Go to next page">
        <icon name="chevron-right-outline" size="s" />
      </button>

      <button class="pagination-item" type="button" @click="onClickLastPage" :class="{ 'cursor-default': isInLastPage }"
        :disabled="isInLastPage" aria-label="Go to last page">
        Fine
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "pagination",
  template: "#pagination",
  props: {
    limit: {
      type: Number,
      required: false,
      default: 5,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    perPage: {
      type: Number,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    classes: {
      type: Object,
      required: false,
      default: () => { },
    },
  },
  data() {
    return {
      visibleButtons: 0,
    };
  },
  beforeMount() {
    if(!this.numPages) {
      this.numPages = Math.ceil(this.totalItems / this.perPage);
    }

    if (this.numPages < this.limit) {
      this.visibleButtons = this.numPages;
    } else {
      this.visibleButtons = this.limit;
    }
  },
  computed: {
    visible() {
      return (
        this.numPages &&
        this.totalItems &&
        this.perPage &&
        this.value &&
        this.totalItems > this.perPage
      );
    },
    startPage() {
      if (this.value === 1) {
        return 1;
      }

      if (this.value === this.numPages) {
        return this.numPages - this.visibleButtons + 1;
      }

      return this.value - 1;
    },
    endPage() {
      return Math.min(
        this.startPage + this.visibleButtons - 1,
        this.numPages
      );
    },
    pages() {
      const range = [];

      for (
        let i = this.startPage;
        i <=
        Math.min(this.startPage + this.visibleButtons - 1, this.numPages);
        i++
      ) {
        range.push({
          name: i,
          isDisabled: i === this.value,
        });
      }

      return range;
    },
    isInFirstPage() {
      return this.value === 1;
    },
    isInLastPage() {
      return this.value >= this.numPages;
    },
    from() {
      return this.perPage * (this.value - 1) + 1
    },
    to() {
      return this.totalItems < this.perPage ? this.totalItems : this.perPage * this.value
    }
  },
  methods: {
    onClickFirstPage() {
      this.$emit("change", 1);
    },
    onClickPreviousPage() {
      this.$emit("change", this.value - 1);
    },
    onClickPage(page) {
      this.$emit("change", page);
    },
    onClickNextPage() {
      this.$emit("change", this.value + 1);
    },
    onClickLastPage() {
      this.$emit("change", this.numPages);
    },
    isPageActive(page) {
      return this.value === page;
    },
  },
};
</script>
<style>
.pagination {
  @apply isolate inline-flex -space-x-px rounded-md shadow-sm my-2;
}

.pagination-item {
  @apply relative inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-800 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 rounded-none;
}

.pagination-item.active {
  @apply bg-green-500 text-white ring-green-500;
}

.pagination-item button {
  @apply bg-transparent;
}

.pagination>.pagination-item:first-child {
  @apply rounded-tl-md rounded-bl-md;
}

.pagination>.pagination-item:last-child {
  @apply rounded-tr-md rounded-br-md;
}
</style>