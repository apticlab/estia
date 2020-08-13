<template>
  <div>
    <div class="flex flex-col">
      <div class="flex flex-col justify-start">
        <h3 class="text-gray-700 text-xl m-0 pb-3">Informazioni Personali</h3>
      </div>
      <div class="mt-4 flex flex-row">
        <div
          class="bg-white rounded border-b border-gray-200 flex-grow flex flex-col items-center justify-center"
        >
          <avatar class="w-48 h-48" :user="user"></avatar>
          <div
            class="text-gray-500 mt-6 text-2xl flex flex-row items-start justify-center"
          >
            @{{ user.username }}
          </div>
        </div>
        <div
          class="bg-white rounded border-b border-grey-200 flex-grow flex flex-col p-4 mx-3 border-r border-grey-200"
        >
          <div
            :key="field.name"
            v-for="field in infoFields"
            class="flex flex-col mb-4"
          >
            <label :for="field.name" class="text-gray-500 text-xs mb-1">
              {{ field.label }}
            </label>
            <span
              v-if="field.type != 'select'"
              class="text-base text-gray-700 pb-3 max-w-60 outline-none"
            >
              {{ user[field.name] }}
            </span>
            <span
              v-if="field.type == 'select'"
              class="text-base text-gray-700 pb-3 max-w-60 outline-none"
            >
              {{ deepFind(user, field.name) }}
            </span>
          </div>
        </div>
        <div
          class="bg-white rounded flex-grow ml-3 p-4 border-b border-gray-200"
        >
          <div
            :key="field.name"
            v-for="field in accountField"
            class="flex flex-col mb-4"
          >
            <label :for="field.name" class="text-gray-500 text-xs mb-1">
              {{ field.label }}
            </label>
            <span
              v-if="field.type == 'role'"
              class="rounded-lg px-3 py-1 text-xs mb-3 mr-auto"
              :class="'pill-color-' + user.role.code"
            >
              {{ user.role.name }}
            </span>
            <span
              v-else
              class="text-base text-gray-700 pb-3 max-w-60 outline-none"
            >
              {{ deepFind(user, field.name) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <hr class="my-3" />
    <div class="flex flex-col py-3" v-if="user.accounts.length">
      <div class="flex-grow flex flex-col justify-start">
        <h3 class="text-gray-700 text-xl m-0">Account Instagram</h3>
      </div>
      <div class="mt-4 grid grid-cols-3 gap-8">
        <div
          v-for="account in user.accounts"
          class="bg-white rounded border-b border-gray-200 flex-grow flex flex-col items-center justify-center mb-2 p-4"
        >
          <div class="flex flex-row w-full items-center">
            <avatar
              class="min-w-20 min-h-20 w-20 h-20"
              :user="account"
              field="profile_pic_url"
            ></avatar>
            <div class="ml-6 flex-grow flex flex-col">
              <span class="text-gray-700 mb-1 text-lg"
                >@{{ account.username }}</span
              >
              <span class="text-sm text-gray-500">ID: {{ account.pk }}</span>
            </div>
          </div>
        </div>
        <!-- <div
          class="py-3 border-gray-200 border-t grid grid-cols-3 flex flex-row items-center"
          v-if="field.roles ? userCanSee(field) : true"
          v-for="field in instagramFields"
          :key="field.name"
        >
          <label class="text-gray-600 uppercase text-sm mr-3 tracking-wide">{{
            field.label
          }}</label>
          <span class="text-gray-900 text-base">
            {{ deepFind(user.account, field.name) }}
          </span>
        </div> -->
      </div>
      <hr class="my-3 col-span-3" />
    </div>
    <!-- <div class="grid grid-cols-3 py-3">
      <div class="flex-grow flex flex-col justify-start">
        <h3 class="text-gray-700 text-xl m-0 ">Fatturazione</h3>
      </div>
      <div class="col-span-2">
        TODO
      </div>
      <hr class="my-3 col-span-3" />
    </div> -->
  </div>
</template>
<script>
import { getProfile } from "../utils/auth.js";

export default {
  props: {
    user: { required: true, default: {} }
  },
  data() {
    return {
      infoFields: [
        {
          name: "name",
          label: "Nome",
          type: "text"
        },
        {
          name: "surname",
          label: "Cognome",
          type: "text"
        },
        {
          name: "email",
          label: "Email",
          type: "email"
        },
        {
          name: "created_at",
          label: "Iscritto il",
          type: "date"
        }
      ],
      accountField: [
        {
          name: "role.code",
          label: "Ruolo",
          type: "role"
        },
        {
          name: "payment_status",
          label: "Stato Pagamenti",
          type: "select"
        }
      ],
      instagramFields: [
        {
          name: "username",
          label: "Username",
          type: "text"
        },
        {
          name: "pk",
          label: "id",
          type: "text",
          roles: ["superadmin"]
        }
        /*
        {
          name: "password",
          label: "Password",
          type: "text"
        }
        */
      ],
      loggedUser: {}
    };
  },
  beforeMount() {
    this.loggedUser = getProfile();
  },
  methods: {
    userCanSee(field) {
      return field.roles.includes(this.loggedUser.role.code);
    }
  },
  computed: {}
};
</script>
