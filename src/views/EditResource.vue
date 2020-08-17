<template>
  <div class="flex flex-col items-center align-center rounded overflow-hidden">
    <loading class="w-full my-16" v-if="loading"></loading>
    <div v-if="!loading" class="w-full max-w-screen-xl mx-auto">
      <div class="px-4">
        <awesome-form
          class="py-5"
          v-if="!loading"
          :form.sync="resource"
          :is_edit="is_edit"
          :headers="form_fields"
          :validate="true"
          @valid="_valid => (valid = _valid)"
          @change="updateResource"
        ></awesome-form>
        <div
          v-if="resourceErrors"
          class="text-red-600 text-semibold px-12 pb-5"
        >
          Ci sono alcuni errori nella form:
          <ol class="list-outside mt-2">
            <li
              :key="error"
              v-for="error in resourceErrors"
              class="flex flex-row items-center"
            >
              <div class="w-2 h-2 rounded-full bg-red-600 mr-2"></div>
              <div>{{ error }}</div>
            </li>
          </ol>
        </div>
        <div class="flex flex-row py-5 items-center w-full justify-end">
          <div class="flex flex-row items-baseline mr-auto">
            <button
              @click="act(action)"
              :class="'bg-' + action.color"
              class="ml-3 px-4 outline-none rounded-none text-white ml-auto focus:outline-none"
              :key="action.label"
              v-for="action in visibleActions"
            >
              <span class="flex flex-row justify-center">
                <i :class="action.icon" class="mr-2 mt-1 text-md"></i>
                <span>{{ action.label }}</span>
              </span>
            </button>
          </div>
          <template v-if="!error">
            <button
              class="btn bg-transparent text-blue mr-3 active:outline-none focus:outline-none hover:text-blue-dark"
              @click="back"
            >
              Chiudi
            </button>
            <button
              :disabled="!valid"
              class="disabled:bg-gray-light disabled:text-gray-dark disabled:cursor-not-allowed bg-blue transition duration-300 ease-in-out text-white items-center"
              @click="saveResource()"
            >
              {{ button_label }}
            </button>
          </template>
          <template v-else>
            <p class="text-red-600 text-weigth-600">{{ error }}</p>
            <button class="btn btn-primary ml-auto" @click="retry()">
              <i class="mr-2 fas fa-redo-alt"></i>
              <span>Riprova</span>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from "@/utils/api.js";
import { mapState } from "vuex";

const rest_resources = {
  profile: "users"
};

export default {
  name: "resource_edit",
  props: {
    component: { required: false, default: false },
    p_resource: { required: false, default: false }
  },
  data() {
    return {
      resourceErrors: null,
      changedResource: {},
      error: null,
      loading: true,
      resource: {},
      resource_rest_name: null,
      resource_name: null,
      actions: [],
      is_edit: false,
      valid: false
    };
  },
  async mounted() {
    this.loading = true;

    this.resource_id = this.p_resource ? null : this.$route.params.id;
    this.resource_name =
      this.p_resource ||
      this.$route.params.resource ||
      this.$route.meta.resource;

    if (this.resource_name == "profile") {
      this.resource_id = this.user.id;
    }

    this.resource_rest_name =
      rest_resources[this.resource_name] || this.resource_name;

    this.actions = this.resources[this.resource_name].actions || [];

    if (this.resource_id) {
      this.is_edit = true;
      this.resource = await api.get(this.resource_rest_name, this.resource_id);
    }

    this.loading = false;
  },
  methods: {
    async saveResource() {
      this.resourceErrors = null;
      let resource_name = this.resource_rest_name || this.resource_name;

      try {
        if (this.is_edit) {
          await api.update(
            resource_name,
            this.resource_id,
            this.changedResource
          );
        } else {
          let resource = _.clone(this.changedResource);
          await api.create(resource_name, resource);
          if (this.p_resource) {
            this.$emit("save", true);
            return;
          }
        }

        this.$router.back();
      } catch (err) {
        console.log(err);

        if (err.errors) {
          this.resourceErrors = [];

          Object.keys(err.errors).map(e => {
            console.log(err.errors[e]);
            this.resourceErrors = this.resourceErrors.concat(err.errors[e]);
          });

          return;
        }

        switch (err.message) {
          case "The given data was invalid.":
            this.error = "Alcuni campi non sono validi.";
            break;

          default:
            this.error = "Ops! C'è stato un errore.";
        }
      }
    },
    async retry() {
      this.error = null;

      await this.saveResource();
    },
    back() {
      if (this.p_resource) {
        this.$emit("close");
        return;
      }

      this.$router.back();
    },
    updateResource(newResource) {
      this.changedResource = newResource;
    },
    act(action) {
      if (this[action.callback]) {
        this[action.callback]();
      }
    },
    delete() {
      if (confirm("Vuoi davvero eliminare questa risorsa?")) {
        this.isLoading = true;
        this.$api.delete(this.resource_name, this.resource_id);
        this.isLoading = false;

        this.$router.push("../list");
      }
    }
  },
  computed: {
    ...mapState("user", {
      user: state => state.user
    }),
    form_fields() {
      let fields = this.resources[this.resource_name].fields || [];

      return fields.filter(field => {
        if (!field.scopes) {
          return true;
        }

        return field.scopes.includes("edit");
      });
    },
    button_label() {
      return this.is_edit ? "Conferma" : "Conferma";
    },
    action_name() {
      return this.is_edit ? "Modifica" : "Nuova";
    },
    resourceInfo() {
      return this.resources[this.resource_name].info || {};
    },
    options() {
      return this.resourceInfo.singular || "Risorsa";
    },
    visibleActions() {
      return this.actions.filter(action => {
        return (
          !action.scopes ||
          action.scopes.includes(this.is_edit ? "edit" : "create")
        );
      });
    }
  }
};
</script>

<style></style>
