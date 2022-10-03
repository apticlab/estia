<template>
  <div class="flex flex-col items-center overflow-hidden rounded align-center">
    <loading v-if="loading" class="w-full my-16" />
    <div v-if="!loading" class="w-full mx-auto max-w-screen-xl">
      <div class="">
        <div
          class="flex flex-row items-center justify-end w-full"
          v-if="!hideActions && commandPosition.includes('top')"
        >
          <div class="flex flex-row items-baseline mr-auto">
            <button
              v-for="action in visibleActions"
              :key="action.label"
              :class="'bg-' + action.color"
              class="
                px-4
                ml-3 ml-auto
                text-white
                rounded-none
                outline-none
                focus:outline-none
              "
              @click="act(action)"
            >
              <span class="flex flex-row justify-center">
                <i :class="action.icon" class="mt-1 mr-2 text-md" />
                <span>{{ action.label }}</span>
              </span>
            </button>
          </div>
          <template v-if="!error">
            <button
              :class="$theme.backButtonClass"
              class="mr-3 active:outline-none focus:outline-none"
              @click="back"
            >
              Chiudi
            </button>
            <button
              :disabled="!valid"
              :class="$theme.saveButtonClass"
              class="transition duration-300 ease-in-out"
              @click="saveResource()"
            >
              {{ button_label }}
            </button>
          </template>
          <template v-else>
            <div class="flex flex-row items-center w-full">
              <button
                :class="$theme.backButtonClass"
                class="mr-3 active:outline-none focus:outline-none"
                @click="back"
              >
                Indietro
              </button>
              <p class="text-red-600 text-weigth-600">
                {{ error }}
              </p>
              <button class="ml-auto btn btn-primary" @click="retry()">
                <i class="mr-2 fas fa-redo-alt" />
                <span>Riprova</span>
              </button>
            </div>
          </template>
        </div>
        <awesome-form
          v-if="!loading"
          :debug="debug"
          class="pb-5"
          :form.sync="resource"
          :is_edit="is_edit"
          :headers="form_fields"
          :validate="true"
          :layout="layout"
          @valid="(_valid) => (valid = _valid)"
          @change="updateResource"
        />
        <div
          v-if="resourceErrors"
          class="px-12 pb-5 text-red-600 text-semibold"
        >
          Ci sono alcuni errori nella form:
          <ol class="mt-2 list-outside">
            <li
              v-for="error in resourceErrors"
              :key="error"
              class="flex flex-row items-center"
            >
              <div class="w-2 h-2 mr-2 bg-red-600 rounded-full" />
              <div>{{ error }}</div>
            </li>
          </ol>
        </div>
        <div
          class="flex flex-row items-center justify-end w-full py-5"
          v-if="!hideActions && commandPosition.includes('bottom')"
        >
          <div class="flex flex-row items-baseline mr-auto">
            <button
              v-for="action in visibleActions"
              :key="action.label"
              :class="'bg-' + action.color"
              class="
                px-4
                ml-3 ml-auto
                text-white
                rounded-none
                outline-none
                focus:outline-none
              "
              @click="act(action)"
            >
              <span class="flex flex-row justify-center">
                <i :class="action.icon" class="mt-1 mr-2 text-md" />
                <span>{{ action.label }}</span>
              </span>
            </button>
          </div>
          <template v-if="!error">
            <button
              :class="$theme.backButtonClass"
              class="mr-3 active:outline-none focus:outline-none"
              @click="back"
            >
              Chiudi
            </button>
            <button
              :disabled="!valid"
              :class="$theme.saveButtonClass"
              class="transition duration-300 ease-in-out"
              @click="saveResource()"
            >
              {{ button_label }}
            </button>
          </template>
          <template v-else>
            <div class="flex flex-row items-center w-full">
              <button
                :class="$theme.backButtonClass"
                class="mr-3 active:outline-none focus:outline-none"
                @click="back"
              >
                Indietro
              </button>
              <p class="text-red-600 text-weigth-600">
                {{ error }}
              </p>
              <button class="ml-auto btn btn-primary" @click="retry()">
                <i class="mr-2 fas fa-redo-alt" />
                <span>Riprova</span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import _ from "lodash";

const rest_resources = {
  profile: "users",
};

export default {
  name: "ResourceEdit",
  props: {
    component: { required: false, default: false },
    propResourceName: {
      required: false,
      type: String,
      default: null,
    },
    propResourceId: {
      required: false,
      type: Number,
      default: null,
    },
    propResourceValue: {
      required: false,
      type: () => {},
      default: null,
    },
    layout: {
      required: false,
      default: "vertical",
    },
    debug: {
      required: false,
      default: false,
    },
    hideActions: {
      required: false,
      default: false,
    },
    commandPosition: {
      required: false,
      default: () => {
        return ["bottom"];
      },
    },
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
      valid: false,
      routerBased: true,
    };
  },
  async mounted() {
    this.loading = true;

    if (this.propResourceName) {
      this.routerBased = false;
      this.resource_id = this.propResourceId;
      this.resource_name = this.propResourceName;
      this.resource = this.propResourceValue;
    } else {
      this.resource_id = this.$route.params.id;
      this.resource_name =
        this.$route.params.resource || this.$route.meta.resource;
    }

    this.resource_rest_name =
      rest_resources[this.resource_name] || this.resource_name;

    this.actions = this.resources[this.resource_name].actions || [];

    if (this.debug) {
      this.log("ResourceName: " + this.resource_name);
      this.log("ResourceId: " + this.resource_id);
    }

    if (this.resource_id) {
      this.is_edit = true;
      this.resource = await this.$api.get(
        this.resource_rest_name,
        this.resource_id
      );
    }

    this.loading = false;
  },
  methods: {
    async saveResource() {
      this.resourceErrors = null;
      let resource_name = this.resource_rest_name || this.resource_name;

      try {
        if (this.is_edit) {
          await this.$api.update(
            resource_name,
            this.resource_id,
            this.changedResource
          );
        } else {
          let resource = _.clone(this.changedResource);
          await this.$api.create(resource_name, resource);
        }

        if (!this.routerBased) {
          this.$emit("save", true);
          return;
        }

        this.$router.back();
      } catch (err) {
        console.log(err);

        if (err.errors) {
          this.resourceErrors = [];

          Object.keys(err.errors).map((e) => {
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
      if (!this.routerBased) {
        this.$emit("close");
        return;
      }

      this.$router.back();
    },
    updateResource(newResource) {
      if (this.debug) {
        this.log("NewResource");
        this.log(newResource);
      }

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
    },
  },
  computed: {
    ...mapState("user", {
      user: (state) => state.user,
    }),
    form_fields() {
      let fields = this.resources[this.resource_name].fields || [];

      return fields.filter((field) => {
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
      return this.actions.filter((action) => {
        return (
          !action.scopes ||
          action.scopes.includes(this.is_edit ? "edit" : "create")
        );
      });
    },
  },
};
</script>

<style></style>
