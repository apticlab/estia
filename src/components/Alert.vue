<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="
        min-h-12
        z-50
        fixed
        bottom-0
        mb-10
        w-full
        px-10
        flex flex-row
        justify-center
      "
    >
      <div
        v-if="type"
        class="w-4/12 shadow flex flex-row justify-between items-center"
        :class="theming.bg"
      >
        <div class="h-full w-1" :class="theming.side_bar"></div>
        <div class="w-full px-4 py-2 pr-0 flex flex-row">
          <div
            v-if="false"
            :class="theming.icon.bg"
            class="
              rounded-full
              h-6
              w-6
              mr-5
              flex flex-col
              items-center
              justify-center
            "
          >
            <i :class="theming.icon.id" class="text-white text-xs"></i>
          </div>
          <div class="flex flex-col w-9/12">
            <p :class="theming.title" class="text-lg leading-6 font-bold mb-3">
              {{ params.title }}
            </p>
            <p
              :class="theming.text"
              class="text-sm leading-5"
              v-html="params.text"
            ></p>
          </div>
        </div>
        <div
          v-if="false"
          :class="theming.close"
          class="ml-10 cursor-pointer w-1/12 h-full"
          @click="hide()"
        >
          <i class="fa fa-times"></i>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import AwAlert from "../plugins/alert";

const visible = ref(false);
const type = ref("");
const params = ref({});
const cancelText = ref("Annulla");
const confirmText = ref("Conferma");
const onConfirm = ref(() => {});

const hide = () => {
  visible.value = false;
  params.value = {};
};

const confirm = (result) => {
  hide();
  onConfirm.value(result);
};

const show = (p) => {
  params.value = p;
  type.value = p.type;
  onConfirm.value = p.onConfirm;

  visible.value = true;

  setTimeout(() => {
    hide();
  }, p.time || 1500);
};

const icon = computed(() => {
  switch (type.value) {
    case "success":
      return "fas fa-check";
    case "error":
      return "fas fa-times";
    case "warn":
      return "fas fa-exclamation";
    default:
      return "fas fa-info";
  }
});

const theming = computed(() => {
  let theme_color = "info";
  switch (type.value) {
    case "success":
      theme_color = "green";
      break;
    case "warn":
      theme_color = "orange";
      break;
    case "error":
      theme_color = "red";
      break;
    default:
      theme_color = "blue";
      break;
  }

  return {
    close: `text-${theme_color}-800`,
    title: `text-${theme_color}-700`,
    side_bar: `bg-${theme_color}-500`,
    text: `text-${theme_color}-700`,
    icon: {
      id: icon.value,
      bg: `bg-${theme_color}-500`,
    },
    bg: `bg-${theme_color}-100`,
  };
});

onMounted(() => {
  AwAlert.EventBus.on("show", show);
});

onBeforeUnmount(() => {
  AwAlert.EventBus.off("show", show);
});
</script>

<style scoped>
</style>
