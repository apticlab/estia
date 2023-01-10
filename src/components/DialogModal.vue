<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-50">
      <icon
        name="x"
        size="l"
        class="
          absolute
          top-[10px]
          right-[10px]
          text-white
          z-[60]
          cursor-pointer
        "
        @click="hide()"
      />
      <div
        :class="$theme.backdropBgColor || 'opacity-50 bg-gray-dark'"
        class="absolute inset-0"
        @click="hide()"
      />
      <div
        ref="backdrop"
        class="absolute inset-0 flex flex-col items-center justify-center"
        @click="handleBackdropClick($event)"
      >
        <div v-if="type == 'change_password'">
          <change-password :params="params" @done="confirm" />
        </div>
        <template v-else-if="type == 'checkin'">
          <check-in-modal
            :params="params"
            :class="is_mobile ? 'h-full w-full' : ''"
            @done="confirm"
          />
        </template>
        <template v-else-if="type == 'checkout'">
          <check-in-modal
            :params="params"
            :class="is_mobile ? 'h-full w-full' : ''"
            @done="confirm"
          />
        </template>
        <template v-else-if="type == 'import-csv'">
          <import-csv-modal :params="params" @done="confirm" />
        </template>
        <template v-else-if="$modalWidgets[type]">
          <component
            :is="$modalWidgets[type]"
            :params="params"
            @done="confirm"
            @hide="hide"
          />
        </template>
        <template v-else>
          <div
            :class="
              is_mobile
                ? 'h-full w-full'
                : 'h-auto my-10 overflow-y-auto sm:w-8/12'
            "
            class="
              flex flex-col
              p-5
              bg-white
              rounded-none
              shadow-2xl
              sm:rounded-lg
            "
          >
            <div class="flex-grow p-4">
              <div class="flex flex-col items-baseline mb-4">
                <div class="flex-cont-col">
                  <h2 class="m-0 mb-8 text-2xl text-black" :class="theme.title">
                    {{ params.title }}
                  </h2>
                  <p>{{ params.text }}</p>
                </div>
                <resource-edit
                  v-if="type == 'resource-edit'"
                  :prop-resource-name="params.resource"
                  :prop-resource-id="params.resourceId"
                  :prop-resource-value="params.values"
                  class="w-full h-auto"
                  @save="confirm()"
                  @close="hide()"
                />
              </div>
            </div>
            <div
              v-if="!type"
              class="
                flex flex-row
                items-center
                justify-between
                px-4
                py-3
                bg-gray-100
                sm:justify-end
              "
            >
              <button
                class="px-3 py-2 ml-0 mr-3 text-blue sm:ml-auto no-outline"
                @click="confirm(false)"
              >
                {{ params.cancelText || defaultCancelText }}
              </button>
              <button
                class="
                  px-3
                  py-2
                  text-white
                  rounded-none
                  bg-blue
                  tx-bold
                  focus:outline-none
                "
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
  name: "DialogModal",
  components: {
    "change-password": ChangePassword,
  },
  data() {
    return {
      // variable that shows/hides modal
      visible: false,
      type: "",
      params: {},
      defaultCancelText: "Annulla",
      defaultConfirmText: "Conferma",
      onConfirm: {},
      onHide: null,
      theme: {},
      exitKeyEvent: null,
    };
  },
  mounted() {
    let that = this;
    this.exitKeyEvent = document.addEventListener("keyup", function (evt) {
      if (evt.keyCode === 27) {
        that.hide();
      }
    });
  },
  computed: {
    themeTitle() {
      return this.theme.title || this.$theme.modal.title;
    },
  },
  beforeMount() {
    Dialog.EventBus.$on("show", this.show);
    Dialog.EventBus.$on("hide", this.hide);
  },
  beforeDestroy() {
    document.removeEventListener("keyup", this.exitKeyEvent);
    Dialog.EventBus.$off("show", this.show);
    Dialog.EventBus.$off("hide", this.hide);
  },
  methods: {
    hide() {
      // method for closing modal
      this.log("hide");
      if (this.onHide) {
        this.onHide();
      }

      this.visible = false;
    },
    confirm(result) {
      this.log("confirm");
      this.hide();
      this.onConfirm(result);
    },
    show(params) {
      this.params = params;
      this.type = params.type;
      this.onConfirm = params.onConfirm;
      this.onHide = params.onHide;
      this.theme = params.theme;

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
    },
  },
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
