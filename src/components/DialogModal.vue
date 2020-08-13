<template>
  <transition name="fade">
    <div v-if="visible" class="z-50 fixed inset-0">
      <div
        class="absolute inset-0 opacity-50 bg-gray-dark"
        @click="hide()"
      ></div>
      <div
        ref="backdrop"
        @click="handleBackdropClick($event)"
        class="absolute inset-0 flex flex-col items-center justify-center"
      >
        <div v-if="type == 'change_password'">
          <change-password
            v-on:done="confirm"
            :params="params"
          ></change-password>
        </div>
        <template v-else-if="type == 'checkin'">
          <check-in-modal
            v-on:done="confirm"
            :params="params"
            :class="is_mobile ? 'h-full w-full' : ''"
          ></check-in-modal>
        </template>
        <template v-else-if="type == 'checkout'">
          <check-in-modal
            v-on:done="confirm"
            :params="params"
            :class="is_mobile ? 'h-full w-full' : ''"
          ></check-in-modal>
        </template>
        <template v-else-if="type == 'import-csv'">
          <import-csv-modal
            v-on:done="confirm"
            :params="params"
          ></import-csv-modal>
        </template>
        <template v-else>
          <div
            :class="is_mobile ? 'h-full w-full' : ''"
            class="bg-white shadow-2xl flex flex-col p-5 rounded-none sm:rounded-lg"
          >
            <div class="p-4 flex-grow">
              <div class="flex flex-col items-baseline mb-4">
                <div class="flex-cont-col">
                  <h2 class="m-0 mb-8 text-2xl text-black">
                    {{ params.title }}
                  </h2>
                  <p>{{ params.text }}</p>
                </div>
                <resource-edit
                  v-if="type == 'resource-edit'"
                  :p_resource="params.resource"
                  class="w-full sm:w-172"
                  @save="confirm()"
                  @close="hide()"
                ></resource-edit>
              </div>
            </div>
            <div
              v-if="!type"
              class="py-3 px-4 bg-gray-100 flex flex-row items-center justify-between sm:justify-end"
            >
              <button
                class="text-blue px-3 py-2 mr-3 ml-0 sm:ml-auto no-outline"
                @click="confirm(false)"
              >
                {{ params.cancelText || defaultCancelText }}
              </button>
              <button
                class="rounded-none bg-blue text-white tx-bold px-3 py-2 focus:outline-none"
                @click="confirm(true)"
              >
                {{ params.confirmText || defaultConfirmText }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<script>
import Dialog from "../plugins/dialog";
import ChangePassword from "@/components/ChangePassword.vue";

export default {
  name: "dialog-modal",
  components: {
    "change-password": ChangePassword
  },
  data() {
    return {
      // variable that shows/hides modal
      visible: false,
      type: "",
      params: {},
      defaultCancelText: "Annulla",
      defaultConfirmText: "Conferma",
      onConfirm: {}
    };
  },
  methods: {
    hide() {
      // method for closing modal
      this.visible = false;
    },
    confirm(result) {
      this.hide();
      this.onConfirm(result);
    },
    show(params) {
      this.params = params;
      this.type = params.type;
      this.onConfirm = params.onConfirm;

      // making modal visible
      this.visible = true;
    },
    handleBackdropClick(event) {
      if (this.params.disableBackdropHide) {
        return;
      }

      if (this.$refs.backdrop == event.target) {
        this.hide();
      }
    }
  },
  beforeMount() {
    Dialog.EventBus.$on("show", this.show);
  },
  beforeDestroy() {
    Dialog.EventBus.$off("show", this.show);
  }
};
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
