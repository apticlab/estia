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
<script>
export default {
  name: 'ChangePasswordStrong',
  props: {
    params: {
      required: true,
      type: Object,
      default () {
        return {
          title: 'Titolo',
          text: 'Testo'
        }
      }
    }
  },
  data () {
    return {
      isLoading: false,
      password: '',
      state: 'idle',
      confirmPassword: '',
      inputType: 'password',
      title: 'Cambia Password',
      confirmText: 'Cambia',
      errors: {},
      rules: [
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
      ]
    }
  },
  computed: {
    passwordsAreEqual () {
      if (!this.password && !this.confirmPassword) {
        return false
      }

      return this.password === this.confirmPassword
    },
    passwordIsPristine () {
      return !this.password && !this.confirmPassword
    },
    passwordError () {
      if (this.passwordIsPristine) {
        return null
      }

      let errors = {}

      if (!this.passwordsAreEqual) {
        errors.equal = true
      }

      if (this.password == this.password.toLowerCase()) {
        errors.uppercase = true
      }

      if (this.password.length < 8) {
        errors.length = true
      }

      if (!/\d/.test(this.password)) {
        errors.number = true
      }

      this.errors = errors

      return Object.keys(errors).length > 0
    },
    confirmIsDisabled () {
      switch (this.state) {
        case 'idle':
          return this.passwordError || this.passwordIsPristine
        case 'loading':
          return true
        case 'success':
          return false
      }
    }
  },
  async mounted () {},
  methods: {
    async forward () {
      switch (this.state) {
        case 'idle':
          await this.changePassword()
          break
        case 'success':
          await this.confirm(true)
          break
      }
    },
    async changePassword () {
      this.isLoading = true
      this.confirmText = 'Caricamento'
      this.state = 'loading'

      try {
        let response = await this.$api.act(
          this.params.resourceName,
          this.params.accountId,
          this.params.action,
          {
            password: this.password
          }
        )

        this.state = 'success'
        this.confirmText = 'Chiudi'
      } catch (e) {
        this.confirmText = 'Cambia'
        this.state = 'idle'
      }

      this.isLoading = false
    },
    confirm (result) {
      this.$emit('done', result)
    }
  }
}
</script>
