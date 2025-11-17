<template>
  <div
    class="install-prompt bottom-0 sm:bottom-10 fixed w-full z-50 flex flex-col items-center justify-center"
    v-if="show_banner && action"
  >
    <div
      class="relative px-4 shadow-lg bg-blue-600-dark py-6 rounded-none sm:rounded-md text-white flex flex-row items-center"
    >
      <button class="close absolute p-0" type="button" data-dismiss="alert" @click="hide()">&times;</button>
      <template v-if="action === actions.INSTALL">
        <div class="flex flex-col mr-10">
          <h2 class="font-semibold text-lg">Installa</h2>
          <span>Vuoi aggiungere questa App alla tua home screen?</span>
        </div>
        <button
          type="button"
          class="button h-10 text-blue-600-dark px-5 rounded-full bg-white"
          @click="install()"
        >
          <span>Installa</span>
        </button>
      </template>

      <template v-else-if="updateExists">
        <div class="flex flex-col mr-10">
          <h2 class="font-semibold text-lg">Aggiornamento</h2>
          <span>E' disponibile una nuova versione!</span>
        </div>
        <button
          type="button"
          class="button h-10 text-blue-600-dark px-5 rounded-full bg-white"
          @click="update()"
        >
          <span>Aggiorna</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const actions = {
  INSTALL: "install",
  UPDATE: "update"
};

const show_banner = ref(false);
const refreshing = ref(false);
const registration = ref(null);
const action = ref(null);
const updateExists = ref(false);

let installEvent;

const install = () => {
  show_banner.value = false;
  installEvent.prompt();
  installEvent.userChoice.then(() => {
    installEvent = null;
  });
  hide();
};

const hide = () => {
  show_banner.value = false;
  action.value = null;
};

const update = () => {
  updateExists.value = false;
  if (registration.value && registration.value.waiting) {
    registration.value.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
};

onMounted(() => {
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    installEvent = e;
    show_banner.value = true;
    action.value = actions.INSTALL;
  });

  // Service Worker update detection
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing.value) return;
      refreshing.value = true;
      window.location.reload();
    });

    navigator.serviceWorker.ready.then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            updateExists.value = true;
            show_banner.value = true;
            action.value = actions.UPDATE;
            registration.value = reg;
          }
        });
      });
    });
  }
});
</script>
<style scoped>
.install-prompt .close {
  right: 10px;
  top: 2px;
}
</style>
