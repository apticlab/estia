<template>
  <div :class="$theme.viewResource.container">
    <div v-if="!isLoading" class="w-full">
      <div class="flex flex-row mb-6">
        <div
          class="flex-row items-baseline ml-auto py-4"
          :class="[
            $theme.viewResource.actionWrapper,
            visibleActions.length > 3 ? 'hidden xl:flex' : 'flex',
          ]"
        >
          <button
            v-for="action in visibleActions"
            :key="action.label"
            :class="[$theme.viewResource.action, action.class]"
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
        :class="$theme.viewResource.infoContainer"
        class="grid grid-cols-12 gap-x-4"
      >
        <div
          v-for="(header, index) in visibleHeaders"
          :key="index"
          class="focus-within:text-blue"
          :class="
            header.type == 'form'
              ? 'border border-rounded-sm border-dotted border-gray-light'
              : 'mb-5 flex flex-col col-span-' +
                (header.colSpan || 12) +
                ' row-span-' +
                (header.rowSpan || 1)
          "
        >
          <label
            class="font-semibold mb-2 text-blue"
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
<script>
export default {
  name: "ViewResource",
  props: {
    scope: { type: String, default: "view" },
    id: { type: Number, default: null },
    resourceNameProp: { type: String, default: null },
  },
  data() {
    return {
      isLoading: true,
      headers: null,
      actions: null,
      resource: null,
    };
  },
  computed: {
    newResourceLabel() {
      return "Nuova";

      /*
      let newResourceLabel = "Aggiungi ";
      newResourceLabel += this.resourceInfo.singular ?? "Risorsa";

      return newResourceLabel;
      */
    },
    resourceName() {
      let resourceNameField = this.resourceInfo
        ? this.resourceInfo.singular
        : null;

      return resourceNameField || "Risorsa";
    },
    visibleActions() {
      return this.actions
        .filter((action) => {
          return !action.scopes || action.scopes.includes(this.scope);
        })
        .filter((action) => {
          console.log(action.visible);
          return this.actionIsVisible(action);
        });
    },
    visibleHeaders() {
      return this.headers.filter((header) =>
        this.fieldIsVisible(header, this.resource)
      );
    },
  },
  async mounted() {
    let resourceName =
      this.resourceNameProp ||
      this.$route.meta.resource ||
      this.$route.params.resource;

    let resourceId = this.id || this.$route.params.id;

    this.isLoading = true;

    this.resource = (await this.$api.get(resourceName, resourceId)) || {};

    this.headers = this.resources[resourceName].fields || [];

    this.actions = this.resources[resourceName].actions || [];
    this.resourceInfo = this.resources[resourceName].info || {};

    this.isLoading = false;
  },
  methods: {
    actionIsVisible(action) {
      let isActionVisible = true;
      if (action.visible) {
        action.visible.forEach((condition) => {
          isActionVisible =
            isActionVisible && this.evaluateCondition(condition, this.resource);
        });
      }

      return isActionVisible;
    },
    fieldIsVisible(header) {
      this.log(header);
      let isRoleVisible = true;
      let isFilterVisible = true;
      let isScopeVisible = true;

      if (header.roles) {
        isRoleVisible = header.roles.includes(this.getUserRole());
      }

      if (header.visible) {
        header.visible.forEach((condition) => {
          isFilterVisible =
            isFilterVisible && this.evaluateCondition(condition, this.resource);
        });
      }

      if (header.scopes) {
        isScopeVisible = header.scopes.includes(this.scope);
      }

      return isRoleVisible && isFilterVisible && isScopeVisible;
    },
    labelClass(header) {
      let cssClass = "";

      switch (header.type) {
        case "form":
          cssClass = "text-gray-700 text-normal";
          break;

        case "fieldset":
          cssClass = "text-gray-dark text-xl font-bold my-5";
          break;

        default:
          cssClass = "text-gray-600 text-sm";
          break;
      }

      return cssClass;
    },
    emitChange(options) {
      this.$emit('change', options);
    },
    edit() {
      this.$router.push("../edit/" + this.resource.id);
    },
    delete() {},
    goToList() {
      this.$router.push("../list");
    },
  },
};
</script>
