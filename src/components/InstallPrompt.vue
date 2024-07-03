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

<script>
import updateMixin from '@/mixin/sw-update.mixin';

const actions = {
  INSTALL: "install",
  UPDATE: "update"
};

let installEvent;
export default {
  name: "installPrompt",
  mixins: [updateMixin],
  data() {
    return {
      show_banner: false,
      refreshing: false,
      registration: null,
      action: null,
      actions: actions
    };
  },
  created() {
    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault();
      installEvent = e;
      this.show_banner = true;
      this.action = actions.INSTALL;
    });

  },
  methods: {
    install() {
      this.show_banner = false;
      installEvent.prompt();
      installEvent.userChoice.then(() => {
        installEvent = null;
      });
      this.hide();
    },
    hide() {
      this.show_banner = false;
      this.action = null;
    },
  }
};
</script>
<style scoped>
.install-prompt .close {
  right: 10px;
  top: 2px;
}
</style>
