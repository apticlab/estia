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
        [cardClassComputed]: true,
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
                class="mb-1 ml-2 text-xs text-gray-600 text-blue-600-dark"
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
                class="mb-1 ml-2 text-xs text-gray-600 text-blue-600-dark"
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
                    text-blue-600
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
                'bg-blue-600-light cursor-not-allowed': submitDisabled,
                'bg-blue-600 cursor-pointer': !submitDisabled,
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
<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import { resetPassword } from "../utils/auth";

const defaultErrorTexts = {
  "wrong-credentials": "Credenziali non valide",
  "generic-error": "Errore generico",
};

const props = defineProps({
  cardClass: {
    required: false,
    type: String,
    default: undefined,
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
});

const router = useRouter();
const route = useRoute();
const theme = useTheme();
const instance = getCurrentInstance();
const $api = instance.appContext.config.globalProperties.$api;

const username = ref(null);
const email = ref("");
const loginStep = ref("login");
const credentials = ref({
  username: "",
  password: "",
});
const isLoading = ref(false);
const mergedErrorTexts = ref({});
const errorText = ref("");
const errorCodeDict = {
  user_not_found: "Matricola non appartenente a nessun utente",
  username_not_sent: "Inserisci una matricola nel campo di testo",
  password_not_insert: "Inserire la password",
};

const cardClassComputed = computed(() => {
  return props.cardClass || theme.loginCardClass;
});

const canLogin = computed(() => {
  return (
    credentials.value.username !== "" && credentials.value.password !== ""
  );
});

const submitDisabled = computed(() => {
  return !canLogin.value || isLoading.value;
});

const submitText = computed(() => {
  if (isLoading.value) {
    return "Caricamento";
  }

  return errorText.value === "" ? "Login" : "Errore";
});

onMounted(() => {
  if (username.value) {
    username.value.focus();
  }

  mergedErrorTexts.value = {
    ...defaultErrorTexts,
    ...props.errorTexts,
  };
});

const login = async () => {
  errorText.value = "";
  isLoading.value = true;

  let loginData = await $api.login(
    credentials.value.username,
    credentials.value.password
  );

  let errorCode = loginData.error || "generic-error";

  // Try to look up for error messages from props and default ones
  if (!(errorCode in mergedErrorTexts.value)) {
    // revert to "generic-error" when errorCode is not recognized
    errorCode = "generic-error";
  }

  errorText.value = mergedErrorTexts.value[errorCode];

  var redirect = route.query.redirect || "";

  isLoading.value = false;

  if (!loginData.error) {
    router.push("/" + redirect);
  }
};

const sendPasswordReset = () => {
  isLoading.value = true;
  errorText.value = "";

  resetPassword(email.value).then(
    (data) => {
      isLoading.value = false;
      email.value = "";
      loginStep.value = "success";
    },
    (err) => {
      email.value = "";
      errorText.value = errorCodeDict[err.code];
      isLoading.value = false;
    }
  );
};

const resetPasswordHandler = ($event) => {
  $event.stopPropagation();
  $event.preventDefault();

  errorText.value = "";
  loginStep.value = "passwordreset";
};

const goBack = () => {
  loginStep.value = "login";
  errorText.value = "";
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
