<template>
  <div>
    <login cardClass="w-1/4 flex flex-col bg-white p-8 rounded">
      <template v-slot:logo="">
        <img
          src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.x26BYzb1DV7gSp5zyqhpRwAAAA%26pid%3DApi%26h%3D160&f=1"
          alt=""
        />
      </template>
      <template v-slot:title> </template>
      <template v-slot:username="{ credentials }">
        <div class="flex flex-col">
          <label for="username" class="mb-2 text-orange-500 font-bold">
            Username
          </label>
          <input
            class="px-2 py-3 bg-orange-100 rounded border border-orange-200 focus:outline-none"
            id="username"
            type="text"
            v-model="credentials.username"
            placeholder="prrr"
          />
        </div>
      </template>
      <template v-slot:password="{ credentials }">
        <div class="flex flex-col">
          <label for="password" class="mb-2 text-orange-500 font-bold">
            Password
          </label>
          <input
            class="px-2 py-3 bg-orange-100 rounded border border-orange-200 focus:outline-none"
            id="password"
            type="password"
            v-model="credentials.password"
            placeholder="Inserisci la password"
          />
        </div>
      </template>
      <template v-slot:submit="{ submit, submitDisabled, submitText }">
        <button
          :disabled="submitDisabled"
          @click="submit"
          class="w-full rounded bg-orange-500 text-white p-4 disabled:cursor-not-allowed disabled:bg-orange-200"
        >
          {{ submitText }}
        </button>
      </template>
      <template v-slot:forgot-password="">
        <span
          class="w-full text-center py-2 text-orange-400 hover:underline cursor-pointer"
        >
          Password dimenticata?
        </span>
      </template>
    </login>
  </div>
</template>
<script></script>
