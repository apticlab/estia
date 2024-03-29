<template>
  <div
    :class="{
      [bgColor]: true,
    }"
    class="
      flex flex-col
      items-center
      justify-center
      h-screen
      px-4
      bg-center bg-no-repeat bg-cover
      sm:px-0
    "
  >
    <div
      :class="{
        [cardClass]: true,
      }"
    >
      <div class="flex flex-row items-center justify-center w-full">
        <slot name="logo"> Logo </slot>
      </div>

      <form class="mt-12" @submit.prevent="login">
        <div class="px-1 py-3 sm:px-4">
          <slot name="title">
            <h1 class="text-3xl font-semibold text-gray-600">Accedi</h1>
          </slot>
          <div class="flex flex-col mt-4 mb-4">
            <slot name="username" :credentials="credentials">
              <label
                for="username"
                class="mb-1 ml-2 text-xs text-gray-600 text-blue-dark"
                >Username</label
              >
              <input
                id="username"
                ref="username"
                v-model="credentials.username"
                placeholder="Inserisci username"
                class="py-2"
                type="text"
              />
            </slot>
          </div>
          <div class="flex flex-col mb-4">
            <slot name="password" :credentials="credentials">
              <label
                for="password"
                class="mb-1 ml-2 text-xs text-gray-600 text-blue-dark"
                >Password</label
              >
              <input
                id="password"
                v-model="credentials.password"
                placeholder="Inserisci password"
                class="py-2"
                type="password"
              />
            </slot>
            <div class="flex flex-row justify-between items-center">
              <slot name="remember-me" :credentials="credentials">
                <div class="flex flex-row justify-center items-center">
                  <input
                    id="remember-me"
                    v-model="credentials.remember_me"
                    type="checkbox"
                  />
                  <label class="ml-3" for="remember-me">Ricordami</label>
                </div>
              </slot>
              <slot name="forgot-password">
                <span
                  class="
                    mt-5
                    ml-auto
                    mr-auto
                    text-xs
                    italic
                    underline
                    cursor-pointer
                    text-blue
                  "
                >
                  Password dimenticata?
                </span>
              </slot>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center px-4">
          <slot
            name="submit"
            :submitText="submitText"
            :submitDisabled="submitDisabled"
            :submit="login"
            :loading="isLoading"
          >
            <button
              :disabled="submitDisabled"
              type="submit"
              class="
                w-full
                p-3
                ml-0
                text-white
                rounded-none
                outline-none
                sm:w-32 sm:ml-auto
                text-normal
              "
              :class="{
                'bg-blue-light cursor-not-allowed': submitDisabled,
                'bg-blue cursor-pointer': !submitDisabled,
              }"
            >
              {{ submitText }}
            </button>
          </slot>
          <slot name="register"> </slot>
          <slot name="error" :errorText="errorText">
            <div
              :class="{
                'opacity-0': errorText == '',
                'opacity-100': errorText != '',
              }"
              class="
                flex flex-col
                items-center
                justify-center
                h-6
                my-5
                text-lg text-center text-red-700
              "
            >
              {{ errorText }}
            </div>
          </slot>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import { resetPassword } from "../utils/auth";

const defaultErrorTexts = {
  "wrong-credentials": "Credenziali non valide",
  "generic-error": "Errore generico",
};

export default {
  name: "Login",
  props: {
    cardClass: {
      required: false,
      type: String,
      default() {
        return this.$theme.loginCardClass;
      },
    },
    bgImage: {
      required: false,
      type: String,
      default: "",
    },
    bgColor: {
      required: false,
      type: String,
      default: "bg-white",
    },
    errorTexts: {
      required: false,
      type: Object,
    },
  },
  data() {
    return {
      email: "",
      loginStep: "login",
      credentials: {
        username: "",
        password: "",
      },
      isLoading: false,
      mergedErrorTexts: {},
      errorText: "",
      errorCodeDict: {
        user_not_found: "Matricola non appartenente a nessun utente",
        username_not_sent: "Inserisci una matricola nel campo di testo",
        password_not_insert: "Inserire la password",
      },
    };
  },
  computed: {
    canLogin: function () {
      return (
        this.credentials.username !== "" && this.credentials.password !== ""
      );
    },
    submitDisabled: function () {
      return !this.canLogin || this.isLoading;
    },
    submitText: function () {
      if (this.isLoading) {
        return "Caricamento";
      }

      return this.errorText === "" ? "Login" : "Errore";
    },
  },
  mounted() {
    if (this.$refs.username) {
      this.$refs.username.focus();
    }

    this.mergedErrorTexts = {
      ...defaultErrorTexts,
      ...this.errorTexts,
    };
  },
  methods: {
    async login() {
      var $route = this.$route;
      var $router = this.$router;

      this.errorText = "";

      this.isLoading = true;

      let loginData = await this.$api.login(
        this.credentials.username,
        this.credentials.password
      );

      let errorCode = loginData.error || "generic-error";

      // Try to look up for error messages from props and default ones
      if (!(errorCode in this.mergedErrorTexts)) {
        // revert to "generic-error" when errorCode is not recognized
        errorCode = "generic-error";
      }

      this.errorText = this.mergedErrorTexts[errorCode];

      var redirect = $route.query.redirect || "";

      this.isLoading = false;

      if (!loginData.error) {
        $router.push("/" + redirect);
      }
    },
    sendPasswordReset: function () {
      this.isLoading = true;
      this.errorText = "";

      resetPassword(this.email).then(
        (data) => {
          this.isLoading = false;
          this.email = "";
          this.loginStep = "success";
        },
        (err) => {
          this.email = "";
          this.errorText = this.errorCodeDict[err.code];
          this.isLoading = false;
        }
      );
    },
    resetPassword: function ($event) {
      $event.stopPropagation();
      $event.preventDefault();

      this.errorText = "";
      this.loginStep = "passwordreset";
    },
    goBack: function () {
      this.loginStep = "login";
      this.errorText = "";
    },
  },
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
