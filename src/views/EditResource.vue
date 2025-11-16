<template>
  <div class="flex flex-col items-center overflow-hidden rounded align-center">
    <loading v-if="loading" class="w-full my-16" />
    <div v-if="!loading" class="w-full mx-auto max-w-screen-xl relative">
      <div :class="[commandPosition.includes('float') ? 'pb-20' : '']">
        <div
          class="flex flex-row items-center justify-end w-full"
          v-if="!hideActions && commandPosition.includes('top')"
        >
          <div class="flex flex-row items-baseline mr-auto">
            <button
              v-for="action in visibleActions"
              :key="action.label"
              :class="'bg-' + action.color"
              class="px-4 ml-3 ml-auto text-white rounded-none outline-none focus:outline-none"
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
              :disabled="!valid || saving"
              :class="$theme.saveButtonClass"
              class="transition duration-300 ease-in-out flex flex-row"
              @click="saveResource()"
            >
              <span v-if="saving">
                <loading size="xs" class="flex !flex-row">
                  <template v-slot:message>
                    <p class="ml-3">Salvataggio in corso</p></template
                  >
                </loading>
              </span>
              <span v-else>{{ button_label }}</span>
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
      </div>
      <div
        class="flex flex-row items-center justify-end w-full py-5"
        :class="[
          commandPosition.includes('float')
            ? 'fixed pl-64 bottom-0 left-0 right-0  px-10 bg-gray-100'
            : '',
        ]"
        v-if="!hideActions && (commandPosition.includes('float') || commandPosition.includes('bottom'))"
      >
        <div class="flex flex-row items-baseline mr-auto">
          <button
            v-for="action in visibleActions"
            :key="action.label"
            :class="'bg-' + action.color"
            class="px-4 ml-3 ml-auto text-white rounded-none outline-none focus:outline-none"
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
            :disabled="!valid || saving"
            :class="$theme.saveButtonClass"
            class="transition duration-300 ease-in-out flex flex-row"
            @click="saveResource()"
          >
            <span v-if="saving">
              <loading size="xs" class="flex !flex-row">
                <template v-slot:message>
                  <p class="ml-3">Salvataggio in corso</p></template
                >
              </loading>
            </span>
            <span v-else>{{ button_label }}</span>
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
</template>

<script setup>
import {
  computed,
  defineExpose,
  getCurrentInstance,
  onMounted,
  ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi, useResources } from "@apticlab/estia/composables";
import clone from "lodash/clone";

const rest_resources = {
  profile: "users",
};

defineOptions({ name: "ResourceEdit" });

const props = defineProps({
  component: { type: Boolean, default: false },
  propResourceName: {
    type: String,
    default: null,
  },
  propResourceId: {
    type: Number,
    default: null,
  },
  propResourceValue: {
    type: [Object, Array, String, Number, Boolean],
    default: null,
  },
  layout: {
    type: String,
    default: "vertical",
  },
  debug: {
    type: Boolean,
    default: false,
  },
  hideActions: {
    type: Boolean,
    default: false,
  },
  commandPosition: {
    type: Array,
    default: () => ["bottom"],
  },
  event: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const router = useRouter();
const api = useApi();
const resources = useResources();
const { proxy } = getCurrentInstance();
const emit = defineEmits(["save", "close"]);

const resourceErrors = ref(null);
const changedResource = ref({});
const error = ref(null);
const loading = ref(true);
const saving = ref(false);
const resource = ref({});
const resourceRestName = ref(null);
const resourceName = ref(null);
const actions = ref([]);
const isEdit = ref(false);
const valid = ref(false);
const routerBased = ref(true);
const resourceId = ref(null);

const actualResourceName = computed(() => resourceName.value);

const form_fields = computed(() => {
  const fields = resources[actualResourceName.value]?.fields || [];
  return fields.filter((field) => {
    if (!field.scopes) {
      return true;
    }
    return field.scopes.includes("edit");
  });
});

const button_label = computed(() => "Conferma");
const action_name = computed(() => (isEdit.value ? "Modifica" : "Nuova"));
const resourceInfo = computed(
  () => resources[actualResourceName.value]?.info || {}
);
const options = computed(() => resourceInfo.value.singular || "Risorsa");

const visibleActions = computed(() =>
  actions.value.filter(
    (action) =>
      !action.scopes ||
      action.scopes.includes(isEdit.value ? "edit" : "create")
  )
);

const getResourceName = () => {
  if (props.propResourceName) {
    routerBased.value = false;
    resourceId.value = props.propResourceId;
    resourceName.value = props.propResourceName;
    resource.value = props.propResourceValue || {};
  } else {
    resourceId.value = route.params.id;
    resourceName.value = route.params.resource || route.meta.resource;
  }

  resourceRestName.value =
    rest_resources[resourceName.value] || resourceName.value;
};

const loadResource = async () => {
  if (resourceId.value) {
    isEdit.value = true;
    resource.value = await api.get(
      resourceRestName.value,
      resourceId.value
    );
  }
};

const logDebug = (...args) => {
  if (props.debug) {
    proxy?.log?.(...args);
  }
};

const saveResource = async () => {
  saving.value = true;
  resourceErrors.value = null;
  const targetResourceName = resourceRestName.value || resourceName.value;

  try {
    if (isEdit.value) {
      await api.update(
        targetResourceName,
        resourceId.value,
        changedResource.value
      );
    } else {
      const cloned = clone(changedResource.value);
      await api.create(targetResourceName, cloned);
    }

    if (props.event) {
      emit("save", true);
      saving.value = false;
      return;
    }

    router.back();
    saving.value = false;
  } catch (err) {
    if (err?.errors) {
      resourceErrors.value = [];
      Object.keys(err.errors).forEach((key) => {
        resourceErrors.value = resourceErrors.value.concat(err.errors[key]);
      });
      saving.value = false;
      return;
    }

    saving.value = false;
    error.value =
      err?.message === "The given data was invalid."
        ? "Alcuni campi non sono validi."
        : "Ops! C'è stato un errore.";
  }
};

const retry = async () => {
  error.value = null;
  await saveResource();
};

const back = () => {
  if (!routerBased.value) {
    emit("close");
    return;
  }
  router.back();
};

const updateResource = (newResource) => {
  logDebug("NewResource", newResource);
  changedResource.value = newResource;
};

const act = (action) => {
  if (!action?.callback) return;
  const handler = proxy?.[action.callback];
  if (typeof handler === "function") {
    handler();
  }
};

const deleteResource = () => {
  if (confirm("Vuoi davvero eliminare questa risorsa?")) {
    loading.value = true;
    api.delete(resourceName.value, resourceId.value);
    loading.value = false;
    router.push("../list");
  }
};

onMounted(async () => {
  loading.value = true;
  getResourceName();

  actions.value = resources[resourceName.value]?.actions || [];
  logDebug("ResourceName:", resourceName.value);
  logDebug("ResourceId:", resourceId.value);

  await loadResource();
  loading.value = false;
});

defineExpose({
  delete: deleteResource,
});
</script>

<style></style>
