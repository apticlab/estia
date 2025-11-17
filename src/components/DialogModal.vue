<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-50">
      <PhX class="absolute top-[10px] right-[10px] text-white z-[60] cursor-pointer h-12 w-12" @click="hide()" />
      <div :class="$theme.backdropBgColor || 'opacity-50 bg-gray-dark'" class="absolute inset-0" @click="hide()" />
      <div ref="backdrop" class="absolute inset-0 flex flex-col items-center justify-center"
        @click="handleBackdropClick($event)">
        <div v-if="type == 'change_password'">
          <change-password :params="params" @done="confirm" />
        </div>
        <template v-else-if="$modalWidgets[type]">
          <component :is="$modalWidgets[type]" :params="params" @done="confirm" @hide="hide" />
        </template>
        <template v-else>
          <div :class="is_mobile
              ? 'h-full w-full'
              : 'h-auto my-10 overflow-y-auto sm:w-8/12'
            " class="flex flex-col p-5 bg-white rounded-none shadow-2xl sm:rounded-lg">
            <div class="flex-grow p-4">
              <div class="flex flex-col items-baseline mb-4">
                <div class="flex-cont-col">
                  <h2 class="m-0 mb-8 text-2xl text-black" :class="theme.title">
                    {{ params.title }}
                  </h2>
                  <p>{{ params.text }}</p>
                </div>
                <resource-edit v-if="type == 'resource-edit'" :prop-resource-name="params.resource"
                  :prop-resource-id="params.resourceId" :prop-resource-value="params.values" :event="true"
                  class="w-full h-auto" @save="confirm()" @close="hide()" />
              </div>
            </div>
            <div v-if="!type" class="flex flex-row items-center justify-between px-4 py-3 bg-gray-100 sm:justify-end">
              <button class="px-3 py-2 ml-0 mr-3 text-blue-600 sm:ml-auto no-outline" @click="confirm(false)">
                {{ params.cancelText || defaultCancelText }}
              </button>
              <button class="px-3 py-2 text-white rounded-none bg-blue-600 tx-bold focus:outline-none"
                @click="confirm(true)">
                {{ params.confirmText || defaultConfirmText }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import Dialog from "../plugins/dialog";
import ChangePassword from "@/components/ChangePassword.vue";
import { PhX } from '@phosphor-icons/vue';

const instance = getCurrentInstance();
const is_mobile = computed(() => instance?.appContext.config.globalProperties.is_mobile);
const log = instance?.appContext.config.globalProperties.log;

const backdrop = ref(null);
const visible = ref(false);
const type = ref("");
const params = ref({});
const defaultCancelText = "Annulla";
const defaultConfirmText = "Conferma";
const onConfirm = ref(() => {});
const onHide = ref(null);
const theme = ref({});
const exitKeyEvent = ref(null);

const themeTitle = computed(() => {
  return theme.value.title || instance?.appContext.config.globalProperties.$theme.modal.title;
});

const hide = () => {
  log?.("hide");
  if (onHide.value) {
    onHide.value();
  }

  visible.value = false;
};

const confirm = (result) => {
  log?.("confirm");
  hide();
  onConfirm.value(result);
};

const show = (p) => {
  params.value = p;
  type.value = p.type;
  onConfirm.value = p.onConfirm;
  onHide.value = p.onHide;
  theme.value = p.theme;

  visible.value = true;
};

const handleBackdropClick = (event) => {
  if (params.value.disableBackdropHide) {
    return;
  }

  if (backdrop.value == event.target) {
    hide();
  }
};

onMounted(() => {
  exitKeyEvent.value = document.addEventListener("keyup", function (evt) {
    if (evt.keyCode === 27) {
      hide();
    }
  });

  Dialog.EventBus.on("show", show);
  Dialog.EventBus.on("hide", hide);
});

onBeforeUnmount(() => {
  document.removeEventListener("keyup", exitKeyEvent.value);
  Dialog.EventBus.off("show", show);
  Dialog.EventBus.off("hide", hide);
});
</script>

<style scoped>
.modal-wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 200px;
  z-index: 1000;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.modal-buttons {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
}

.modal-button {
  flex-grow: 1;
}
</style>
