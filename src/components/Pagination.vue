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

<script setup>
import { ref, computed, onMounted } from 'vue';
import Icon from './Icon.vue';

const props = defineProps({
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
    default: () => {},
  },
});

const emit = defineEmits(['change']);

const visibleButtons = ref(0);
const numPages = ref(0);

onMounted(() => {
  if (!numPages.value) {
    numPages.value = Math.ceil(props.totalItems / props.perPage);
  }

  if (numPages.value < props.limit) {
    visibleButtons.value = numPages.value;
  } else {
    visibleButtons.value = props.limit;
  }
});

const visible = computed(() => {
  return (
    numPages.value &&
    props.totalItems &&
    props.perPage &&
    props.value &&
    props.totalItems > props.perPage
  );
});

const startPage = computed(() => {
  if (props.value === 1) {
    return 1;
  }

  if (props.value === numPages.value) {
    return numPages.value - visibleButtons.value + 1;
  }

  return props.value - 1;
});

const endPage = computed(() => {
  return Math.min(
    startPage.value + visibleButtons.value - 1,
    numPages.value
  );
});

const pages = computed(() => {
  const range = [];

  for (
    let i = startPage.value;
    i <= Math.min(startPage.value + visibleButtons.value - 1, numPages.value);
    i++
  ) {
    range.push({
      name: i,
      isDisabled: i === props.value,
    });
  }

  return range;
});

const isInFirstPage = computed(() => {
  return props.value === 1;
});

const isInLastPage = computed(() => {
  return props.value >= numPages.value;
});

const from = computed(() => {
  return props.perPage * (props.value - 1) + 1;
});

const to = computed(() => {
  return props.totalItems < props.perPage ? props.totalItems : props.perPage * props.value;
});

const onClickFirstPage = () => {
  emit("change", 1);
};

const onClickPreviousPage = () => {
  emit("change", props.value - 1);
};

const onClickPage = (page) => {
  emit("change", page);
};

const onClickNextPage = () => {
  emit("change", props.value + 1);
};

const onClickLastPage = () => {
  emit("change", numPages.value);
};

const isPageActive = (page) => {
  return props.value === page;
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