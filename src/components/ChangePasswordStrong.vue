<template>
  <div class="flex flex-col max-w-2xl w-full bg-white rounded shadow-xl">
    <div class="flex-grow p-6 py-4">
      <h3 class="mb-5 text-xl font-bold text-green-600">
        {{ title }}
      </h3>
      <div v-if="state == 'idle'">
        <ul class="mb-5">
          <li
            v-for="rule in rules"
            class="flex flex-row items-center mb-1"
          >
            <div class="w-2 h-2 rounded-full bg-green-500 mr-2" />
            {{ rule.label }}
            <span
              v-if="!passwordIsPristine"
              class="ml-auto"
            >
              <icon
                v-if="!errors[rule.code]"
                class="text-green-500"
                name="check"
              />
              <icon
                v-else
                class="text-red-500"
                name="x"
              />
            </span>
          </li>
        </ul>
        <div class="flex items-center">
          <div
            class="ml-auto text-gray-600 cursor-pointer hover:text-gray-700"
            @mouseenter="inputType = 'text'"
            @mouseleave="inputType = 'password'"
          >
            Vedi password
          </div>
        </div>
        <div class="mb-5">
          <label
            class="mb-3 text-gray-600"
            for=""
          >
            Nuova Password
          </label>
          <input
            v-model="password"
            :type="inputType"
            class=""
          >
        </div>
        <div>
          <label
            class="mb-3 text-gray-600"
            for=""
          >
            Conferma Nuova Password
          </label>
          <input
            v-model="confirmPassword"
            :type="inputType"
            class=""
          >
        </div>
      </div>
      <div v-if="state == 'loading'">
        <loading />
      </div>
      <div v-if="state == 'success'">
        <div class="text-lg text-center h-32 flex items-center justify-center">
          <div>
            La password è stata aggiornata con successo.
            <br>
            Nuova password:
            <span class="font-bold text-green-600">{{ password }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-row px-6 py-4 bg-gray-200 items-center">
      <div
        v-if="passwordError"
        class="text-red-700 text-center flex items-center"
      >
        <icon
          class="mr-1"
          name="exclamation-outline"
          size="m"
          color="text-red-700"
        />
        La password non è valida
      </div>
      <div class="ml-auto">
        <button @click="confirm(false)">
          Annulla
        </button>
        <button
          :disabled="confirmIsDisabled"
          class="px-3 py-2 ml-3 text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          @click="forward()"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import Icon from '@/components/Icon.vue';

const props = defineProps({
  params: {
    required: true,
    type: Object,
    default() {
      return {
        title: 'Titolo',
        text: 'Testo'
      };
    }
  }
});

const emit = defineEmits(['done']);

// Get $api from global properties
import { getCurrentInstance } from 'vue';
const instance = getCurrentInstance();
const $api = instance?.appContext.config.globalProperties.$api;

const isLoading = ref(false);
const password = ref('');
const state = ref('idle');
const confirmPassword = ref('');
const inputType = ref('password');
const title = ref('Cambia Password');
const confirmText = ref('Cambia');
const errors = ref({});

const rules = [
  {
    code: 'equal',
    label: 'Le password devono coincidere'
  },
  {
    code: 'length',
    label: 'La password deve essere lunga almeno 8 caratteri'
  },
  {
    code: 'number',
    label: 'La password deve contenere almeno 1 numero'
  },
  {
    code: 'uppercase',
    label: 'La password deve contenere almeno 1 lettera maiuscola'
  },
  {
    code: 'special',
    label:
      'La password deve contenere almeno uno tra i seguenti caratteri: !#@?_-;:'
  }
];

const passwordsAreEqual = computed(() => {
  if (!password.value && !confirmPassword.value) {
    return false;
  }

  return password.value === confirmPassword.value;
});

const passwordIsPristine = computed(() => {
  return !password.value && !confirmPassword.value;
});

const passwordError = computed(() => {
  if (passwordIsPristine.value) {
    return null;
  }

  let errorsObj = {};

  if (!passwordsAreEqual.value) {
    errorsObj.equal = true;
  }

  if (password.value === password.value.toLowerCase()) {
    errorsObj.uppercase = true;
  }

  if (password.value.length < 8) {
    errorsObj.length = true;
  }

  if (!/\d/.test(password.value)) {
    errorsObj.number = true;
  }

  errors.value = errorsObj;

  return Object.keys(errorsObj).length > 0;
});

const confirmIsDisabled = computed(() => {
  switch (state.value) {
    case 'idle':
      return passwordError.value || passwordIsPristine.value;
    case 'loading':
      return true;
    case 'success':
      return false;
    default:
      return false;
  }
});

const forward = async () => {
  switch (state.value) {
    case 'idle':
      await changePassword();
      break;
    case 'success':
      await confirm(true);
      break;
  }
};

const changePassword = async () => {
  isLoading.value = true;
  confirmText.value = 'Caricamento';
  state.value = 'loading';

  try {
    await $api?.act(
      props.params.resourceName,
      props.params.accountId,
      props.params.action,
      {
        password: password.value
      }
    );

    state.value = 'success';
    confirmText.value = 'Chiudi';
  } catch (e) {
    confirmText.value = 'Cambia';
    state.value = 'idle';
  }

  isLoading.value = false;
};

const confirm = (result) => {
  emit('done', result);
};
</script>
