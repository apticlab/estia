<template>
  <div class="md:w-172 w-full bg-white shadow-2xl flex flex-col">
    <div class="h-2 bg-indigo-700"></div>
    <div class="p-4">
      <div class="flex flex-row items-baseline">
        <div
          class="min-w-10 min-h-10 rounded-full bg-indigo-200 flex flex-row items-center justify-center"
        >
          <i class="hi-lock-open tx-indigo-700 text-2xl"></i>
        </div>
        <div class="flex flex-col ml-4 mr-4 min-h-64 flex-grow">
          <h2 class="m-0 mb-4 font-medium text-2xl">Cambio Password</h2>
          <div class="flex flex-col flex-grow" v-if="state == 'idle'">
            <p>
              Per cambiare la password è sufficiente inserire il nuovo valore
              nella casella di testo e premere 'Cambia', quindi attendere la
              fine della procedura e comunicare all'utente la nuova password",
            </p>
            <label for="new-password" class="text-gray-500 text-xs mb-1 mt-3">
              Nuova password
            </label>
            <input
              type="text"
              id="new-password"
              v-model="newPassword"
              class="rounded bg-indigo-100 text-base text-gray-600 px-3 py-3 outline-none border-1 border-indigo-200"
            />
          </div>
          <div
            v-if="state == 'loading'"
            class="flex-grow flex flex-col items-center mr-16"
          >
            <div class="flex flex-col items-center justify-center">
              <loading style="height: 60px" class="mb-4"></loading>
              <span class="text-xl text-gray-500">
                Caricamento
              </span>
            </div>
          </div>
          <div
            v-if="state == 'passwordChanged'"
            class="flex-grow flex flex-col items-center mr-16"
          >
            <span class="text-base">Nuova password da comunicare:</span>
            <span class="font-medium text-indigo-700 text-2xl mt-3">
              {{ newPassword }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div
      class="py-3 px-4 bg-gray-100 border-gray-200 border-t-1 flex flex-row items-center"
    >
      <button
        class="text-gray-700 px-3 py-2 mr-3 ml-auto outline-none"
        @click="confirm(false)"
      >
        {{ cancelText }}
      </button>
      <button
        :class="{
          disabled: btnDisabled
        }"
        class="rounded bg-indigo-200 text-indigo-700 font-medium px-3 py-2 outline-none"
        @click="handleChangePassword()"
      >
        {{ confirmText }}
      </button>
    </div>
  </div>
</template>
<script>
import { api } from "../utils/api.js";

export default {
  props: {
    params: { required: true, default: {} }
  },
  data() {
    return {
      state: "idle",
      newPassword: "",
      cancelText: "Annulla"
    };
  },
  mounted() {},
  methods: {
    confirm(result) {
      this.$emit("done", { result: result });
    },
    handleChangePassword() {
      switch (this.state) {
        case "idle":
          this.state = "loading";
          this.changePassword();
          break;
        case "passwordChanged":
          this.confirm(true);
          break;
      }
    },
    async changePassword() {
      let result = await api.act(
        "users",
        this.params.user_id,
        "change_password",
        {
          new_password: this.newPassword
        }
      );

      this.state = "passwordChanged";
    }
  },
  computed: {
    confirmText() {
      let confirmText = "";

      switch (this.state) {
        case "idle":
          confirmText = "Cambia";
          break;
        case "loading":
          confirmText = "Cambiando...";
          break;
        case "passwordChanged":
          confirmText = "Chiudi";
          break;
      }

      return confirmText;
    },
    btnDisabled() {
      switch (this.state) {
        case "idle":
          return this.newPassword == "";
        case "loading":
          return true;
        case "passwordChanged":
          return false;
      }
    }
  }
};
</script>
