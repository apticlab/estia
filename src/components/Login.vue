<template>
  <div
    v-bind:style="{ 'background-image': 'url(./img/login_bg.jpg)' }"
    class="bg-blue flex flex-col items-center justify-center h-screen px-4 sm:px-0 bg-no-repeat bg-cover bg-center"
  >
    <div
      class="w-full sm:w-76 px-10 py-10 rounded-md flex flex-col flex-grow-0 bg-white overflow-hidden mt-2"
    >
      <div class="w-full bg-white flex flex-row items-center justify-center">
        <img src="/img/security_logo@2x.png" class="object-contain h-12" />
      </div>

      <form class="mt-12" v-on:submit.prevent="login">
        <div class="py-3 px-1 sm:px-4">
          <h1 class="text-blue-dark text-3xl font-semibold">Accedi</h1>
          <div class="flex flex-col mb-4 mt-4">
            <label
              for="username"
              class="text-gray-600 text-xs mb-1 ml-2 text-blue-dark"
              >Username</label
            >
            <input
              placeholder="Inserisci username"
              class="py-2"
              ref="username"
              type="text"
              id="username"
              v-model="username"
            />
          </div>
          <div class="flex flex-col mb-4">
            <label
              for="password"
              class="text-gray-600 text-xs mb-1 ml-2 text-blue-dark"
              >Password</label
            >
            <input
              placeholder="Inserisci password"
              class="py-2"
              type="password"
              id="password"
              v-model="password"
            />
            <span
              class="text-blue ml-auto mr-auto underline italic mt-5 text-xs cursor-pointer"
              >Password dimenticata?</span
            >
          </div>
        </div>
        <div class="px-4 flex flex-row justify-center items-center">
          <div
            :class="{
              'opacity-0': errorText == '',
              'opacity-100': errorText != ''
            }"
            class="flex flex-col items-center justify-center my-5 text-center h-6 text-lg text-red-700"
          >
            {{ errorText }}
          </div>
          <button
            :disabled="submitDisabled"
            type="submit"
            class="text-white w-full sm:w-32 ml-0 sm:ml-auto p-3 text-normal outline-none rounded-none"
            :class="{
              'bg-blue-light cursor-not-allowed': submitDisabled,
              'bg-blue cursor-pointer': !submitDisabled
            }"
          >
            {{ submitText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import { login, resetPassword } from "../utils/auth";

export default {
  name: "login",
  data() {
    return {
      email: "",
      loginStep: "login",
      username: "",
      password: "",
      isLoading: false,
      errorText: "",
      errorCodeDict: {
        user_not_found: "Matricola non appartenente a nessun utente",
        username_not_sent: "Inserisci una matricola nel campo di testo",
        password_not_insert: "Inserire la password"
      }
    };
  },
  mounted() {
    this.$refs.username.focus();
  },
  methods: {
    async login() {
      var $route = this.$route;
      var $router = this.$router;

      this.errorText = "";

      if (this.password.length < 4) {
        this.errorText = "Inserire la password";
        return 0;
      }

      this.isLoading = true;

      let loginData = await login(this.username, this.password);

      if (loginData.error) {
        this.isLoading = false;
        this.errorText = "Credenziali non valide";
        return;
      }

      var redirect = $route.query.redirect || "";

      this.isLoading = false;
      $router.push("/" + redirect);
    },
    sendPasswordReset: function() {
      this.isLoading = true;
      this.errorText = "";

      resetPassword(this.email).then(
        data => {
          this.isLoading = false;
          this.email = "";
          this.loginStep = "success";
        },
        err => {
          this.email = "";
          this.errorText = this.errorCodeDict[err.code];
          this.isLoading = false;
        }
      );
    },
    resetPassword: function($event) {
      $event.stopPropagation();
      $event.preventDefault();

      this.errorText = "";
      this.loginStep = "passwordreset";
    },
    goBack: function() {
      this.loginStep = "login";
      this.errorText = "";
    }
  },
  computed: {
    canLogin: function() {
      this.errorText = "";
      return this.username != "" && this.password != "";
    },
    submitDisabled: function() {
      return !this.canLogin || this.isLoading;
    },
    submitText: function() {
      if (this.isLoading) {
        return "Caricamento";
      }

      return this.errorText == "" ? "Login" : "Errore";
    }
  }
};
</script>
<style>
::placeholder {
  @apply italic text-xs;
}

input {
  @apply w-32;
}
</style>
