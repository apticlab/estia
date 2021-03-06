<template>
  <div class="">
    <div v-if="!isLoading" class="w-full">
      <div class="flex flex-row mb-8">
        <div class="flex flex-row items-baseline ml-auto py-4">
          <button
            v-for="action in visibleActions"
            :key="action.label"
            :class="'bg-' + action.color"
            class="ml-3 px-4 outline-none rounded-none text-white ml-auto focus:outline-none"
            @click="act(action)"
          >
            <span class="flex flex-row justify-center">
              <i :class="action.icon" class="mr-2 mt-1 text-md" />
              <span>{{ action.label }}</span>
            </span>
          </button>
        </div>
      </div>
      <div class="grid grid-cols-12 col-gap-4">
        <div
          v-for="(header, index) in headers"
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
      return this.actions.filter((action) => {
        return !action.scopes || action.scopes.includes("view");
      });
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

    let headers = this.resources[resourceName].fields || [];
    this.headers = headers.filter((field) => {
      if (!field.scopes) {
        return true;
      }

      return field.scopes.includes("view");
    });

    this.actions = this.resources[resourceName].actions || [];
    this.resourceInfo = this.resources[resourceName].info || {};

    this.isLoading = false;
  },
  methods: {
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
    act(action) {
      if (this[action.callback]) {
        this[action.callback]();
      }
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
