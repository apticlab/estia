<template>
  <div :class="theme.viewResource.container">
    <div v-if="!isLoading" class="w-full">
      <div class="flex flex-row mb-6">
        <div
          class="flex-row items-baseline ml-auto py-4"
          :class="[
            theme.viewResource.actionWrapper,
            visibleActions.length > 3 ? 'hidden xl:flex' : 'flex',
          ]"
        >
          <button
            v-for="action in visibleActions"
            :key="action.label"
            :class="[theme.viewResource.action, action.class]"
            class="ml-3 px-4 outline-none focus:outline-none"
            @click="act(action, resource)"
          >
            <span class="flex flex-row justify-center">
              <i
                v-if="$icon == 'fontawesome'"
                :class="action.icon"
                class="mr-2 mt-1 text-md"
              />
              <icon
                v-else-if="$icon == 'heroicons'"
                :name="action.icon"
                class="mr-2 mt-1 text-md"
              />
              <span>{{ action.label }}</span>
            </span>
          </button>
        </div>
        <select-menu
          :actions="visibleActions"
          @act="(action) => act(action, resource)"
          :class="visibleActions.length <= 3 ? 'hidden' : 'xl:hidden block ml-auto'"
        />
      </div>
      <div
        :class="theme.viewResource.infoContainer"
        class="grid grid-cols-12 gap-x-4"
      >
        <div
          v-for="(header, index) in visibleHeaders"
          :key="index"
          class="focus-within:text-blue-600"
          :class="
            header.type == 'form'
              ? 'border border-rounded-sm border-dotted border-gray-200'
              : 'mb-5 flex flex-col col-span-' +
                (header.colSpan || 12) +
                ' row-span-' +
                (header.rowSpan || 1)
          "
        >
          <label
            class="font-semibold mb-2 text-blue-600"
            :class="labelClass(header)"
            :for="header.code"
          >
            {{ header.label }}
          </label>
          <field-view :data="resource" :field="header" />
        </div>
      </div>
    </div>
    <loading v-if="isLoading" class="flex-grow w-full h-64" />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { useCurrentUser } from '@/composables/useCurrentUser';

const props = defineProps({
  scope: { type: String, default: "view" },
  id: { type: Number, default: null },
  resourceNameProp: { type: String, default: null },
});

const emit = defineEmits(['change']);

const route = useRoute();
const router = useRouter();
const theme = useTheme();
const instance = getCurrentInstance();
const { getUserRole } = useCurrentUser();

const $api = instance?.appContext.config.globalProperties.$api;
const resources = instance?.appContext.config.globalProperties.resources;
const log = instance?.appContext.config.globalProperties.log;
const evaluateCondition = instance?.appContext.config.globalProperties.evaluateCondition;
const $icon = instance?.appContext.config.globalProperties.$icon;
const act = instance?.appContext.config.globalProperties.act;

const isLoading = ref(true);
const headers = ref(null);
const actions = ref(null);
const resource = ref(null);
const resourceInfo = ref(null);

const newResourceLabel = computed(() => {
  return "Nuova";
});

const resourceName = computed(() => {
  let resourceNameField = resourceInfo.value
    ? resourceInfo.value.singular
    : null;

  return resourceNameField || "Risorsa";
});

const visibleActions = computed(() => {
  if (!actions.value) return [];
  
  return actions.value
    .filter((action) => {
      return !action.scopes || action.scopes.includes(props.scope);
    })
    .filter((action) => {
      return actionIsVisible(action);
    });
});

const visibleHeaders = computed(() => {
  if (!headers.value) return [];
  
  return headers.value.filter((header) =>
    fieldIsVisible(header, resource.value)
  );
});

const actionIsVisible = (action) => {
  let isActionVisible = true;
  if (action.visible) {
    action.visible.forEach((condition) => {
      isActionVisible =
        isActionVisible && evaluateCondition?.(condition, resource.value);
    });
  }

  return isActionVisible;
};

const fieldIsVisible = (header) => {
  log?.(header);
  let isRoleVisible = true;
  let isFilterVisible = true;
  let isScopeVisible = true;

  if (header.roles) {
    isRoleVisible = header.roles.includes(getUserRole());
  }

  if (header.visible) {
    header.visible.forEach((condition) => {
      isFilterVisible =
        isFilterVisible && evaluateCondition?.(condition, resource.value);
    });
  }

  if (header.scopes) {
    isScopeVisible = header.scopes.includes(props.scope);
  }

  return isRoleVisible && isFilterVisible && isScopeVisible;
};

const labelClass = (header) => {
  let cssClass = "";

  switch (header.type) {
    case "form":
      cssClass = "text-gray-700 text-normal";
      break;

    case "fieldset":
      cssClass = "text-gray-800 text-xl font-bold my-5";
      break;

    default:
      cssClass = "text-gray-600 text-sm";
      break;
  }

  return cssClass;
};

const emitChange = (options) => {
  emit('change', options);
};

const edit = () => {
  router.push("../edit/" + resource.value.id);
};

const deleteResource = () => {};

const goToList = () => {
  router.push("../list");
};

onMounted(async () => {
  let resourceNameValue =
    props.resourceNameProp ||
    route.meta.resource ||
    route.params.resource;

  let resourceId = props.id || route.params.id;

  isLoading.value = true;

  resource.value = (await $api?.get(resourceNameValue, resourceId)) || {};

  headers.value = resources?.[resourceNameValue]?.fields || [];

  actions.value = resources?.[resourceNameValue]?.actions || [];
  resourceInfo.value = resources?.[resourceNameValue]?.info || {};

  isLoading.value = false;
});

// Expose theme to template
defineExpose({
  $theme: theme
});
</script>
