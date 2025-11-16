<template>
  <div :id="id">
   <loading v-if="loading" />
    <FormKit type="form" v-if="!loading" name="aw-form" :id="id + '-form'" class="w-full grid grid-cols-12 gap-x-6"
      :values="dataForm">
      <pre v-if="debug">
        form: {{ dataForm }}
        valid: {{ form_is_valid }}
        visible_headers: {{ visible_headers.length }}
      </pre>
      <div :id="'aw-' + getIdName(header, index)" v-for="(header, index) in visible_headers" :key="index"
        class="relative focus-within:text-blue-600" :class="formFieldClass(header)">
        <slot :class="getLabelClass(header)" name="label" :header="header" :isRequired="header.validator
          ? header.validator.indexOf('required') != -1
          : false
          ">
          <component :header="header" :isRequired="header.validator
            ? header.validator.indexOf('required') != -1
            : false
            " :class="getLabelClass(header)" :is="getLabelComponentName(header.label)"
            v-if="isLabelComponent(header.label)" />
          <div class="flex flex-row items-center" v-else-if="header.label">
            <label :class="getLabelClass(header)" :for="header.field">
              {{ isObject(header.label) ? header.label.value : header.label }}
              <span v-if="
                header.validator
                  ? header.validator.indexOf('required') != -1
                  : false
              " class="ml-1 font-bold text-orange-600">*</span>
            </label>
            <PhInfo v-if="header.label.help" class="text-gray-400 ml-2 cursor-pointer size-6"
              :title="header.label.help.value" />
          </div>
        </slot>

        <div v-if="$editFields[header.type]" class="w-full">
          <component :is="$editFields[header.type]" :disabled="fieldIsReadonly(header)"
            :resources="filterOptions(header)" :header="header" :form-data="dataForm"
            :value="deepPick(dataForm, header.field)" :labelClass="getLabelClass(header)"
            @change="($event) => updateNested(header.field, $event)" />
        </div>
        <template v-else-if="header.field && header.field.includes('.')">
          <resource-select v-if="header.type == 'select'" :disabled="fieldIsReadonly(header)"
            :resources="form_options[header.code] || filterOptions(header)" :header="header"
            :placeholder="header.placeholder" :value="deepPick(dataForm, header.field)"
            @change="($event) => updateNested(header.field, $event)" />
          <input v-if="header.type == 'text'" type="text" :value="deepPick(dataForm, header.field)"
            @input="($event) => updateNested(header.field, $event.target.value)" />
          <input v-if="header.type == 'password'" type="password" :value="deepPick(dataForm, header.field)"
            @input="($event) => updateNested(header.field, $event.target.value)" />
          <input v-if="header.type == 'number'" type="number" :value="deepPick(dataForm, header.field)"
            @input="($event) => updateNested(header.field, $event.target.value)" />
          <template v-if="header.type == 'boolean'">
            <label class="flex custom-label" @click="handleBooleanClick(header)">
              <div class="flex items-center justify-center w-6 h-6 p-1 mr-2 bg-white shadow">
                <svg :class="!!deepPick(dataForm, header.field) ? '' : 'hidden'"
                  class="w-4 h-4 text-green-600 pointer-events-none" viewBox="0 0 172 172">
                  <g fill="none" stroke-width="none" stroke-miterlimit="10" font-family="none" font-weight="none"
                    font-size="none" text-anchor="none" style="mix-blend-mode: normal">
                    <path d="M0 172V0h172v172z" />
                    <path d="M145.433 37.933L64.5 118.8658 33.7337 88.0996l-10.134 10.1341L64.5 139.1341l91.067-91.067z"
                      fill="currentColor" stroke-width="1" />
                  </g>
                </svg>
              </div>
            </label>
          </template>
          <textarea v-if="header.type == 'textarea'" :value="deepPick(dataForm, header.field)"
            @input="($event) => updateNested(header.field, $event.target.value)" />
          <v-date-picker v-if="header.type == 'date'" locale="it" :min-date="header.minDate"
            :value="deepPick(dataForm, header.field)"
            @input="($event) => updateNested(header.field, formatDate($event))">
            <template v-slot="{ inputValue, inputEvents }">
              <input :value="inputValue" v-on="inputEvents" />
            </template>
          </v-date-picker>
        </template>
        <div v-else-if="header.type !== 'fieldset'">
          <template v-if="header.type == 'form'">
            <awesome-form class="px-10 w-12/12" :form="dataForm[header.field]" :headers="header.headers"
              :validate="header.validate" @change="(value) => updateNested(header.field, value)" />
          </template>
          <template v-else-if="header.type == 'dynamicRadio'">
            <p v-if="!form_options[header.field]">
              {{ header.info }}
            </p>
            <FormKit v-if="form_options[header.field]" :id="header.field" :key="header.field"
              :readonly="fieldIsReadonly(header)" type="radio" :placeholder="header.placeholder" :name="header.field"
              :header="header" :options="form_options[header.field]"
              @input="(value) => updateNested(header.field, value)" />
          </template>
          <template v-else-if="header.type == 'select'">
            <FormKit type="resource-select" class="flex-grow" :disabled="fieldIsReadonly(header)"
              :name="header.field" :resources="form_options[header.code] || filterOptions(header)"
              :option-field="header.select.option" :placeholder="header.placeholder" :select="header.select"
              @input="(value) => updateNested(header.field, value)" />
          </template>
          <template v-else-if="header.type == 'dynamic-select' || header.type == 'user'">
            <FormKit :key="header.field" type="dynamic-select" :name="header.field" :header="header"
              :readonly="fieldIsReadonly(header)" @input="(value) => updateNested(header.field, value)" />
          </template>
          <template v-else-if="header.type == 'balance'">
            <div class="flex">
              <FormKit :id="header.field" :key="header.field" type="number" :readonly="fieldIsReadonly(header)"
                :placeholder="header.placeholder" :name="header.field" class="flex-grow rounded-r-none"
                @input="(value) => updateNested(header.field, value)" />
              <div
                class="flex items-center bg-gray-200 border border-l-0 border-gray-300 rounded rounded-l-none border-l-none">
                <span class="px-3 text-gray-600">{{ header.udm }}</span>
              </div>
            </div>
          </template>
          <template v-else-if="header.type == 'boolean'">
            <label class="flex custom-label">
              <div id="checkbox-container" class="flex items-center justify-center w-6 h-6 p-1 mr-2 bg-white shadow">
                <FormKit :id="header.field" :readonly="fieldIsReadonly(header)" type="checkbox" class="hidden"
                  :name="header.field" @input="(value) => updateNested(header.field, value)" />
                <svg id="checkbox-check" :class="!!deepFind(dataForm, header.field) ? '' : 'hidden'"
                  class="w-4 h-4 text-green-600 pointer-events-none" viewBox="0 0 172 172">
                  <g fill="none" stroke-width="none" stroke-miterlimit="10" font-family="none" font-weight="none"
                    font-size="none" text-anchor="none" style="mix-blend-mode: normal">
                    <path d="M0 172V0h172v172z" />
                    <path d="M145.433 37.933L64.5 118.8658 33.7337 88.0996l-10.134 10.1341L64.5 139.1341l91.067-91.067z"
                      fill="currentColor" stroke-width="1" />
                  </g>
                </svg>
              </div>
            </label>
          </template>
          <template v-else-if="header.type == 'image_upload'">
            <FormKit :id="header.field" :key="header.field" type="image-uploader"
              :readonly="fieldIsReadonly(header)" :placeholder="header.placeholder" :name="header.field"
              @input="(value) => updateNested(header.field, value)" />
          </template>
          <FormKit v-else :key="header.field" :readonly="fieldIsReadonly(header)" :type="header.type"
            :placeholder="header.placeholder" :name="header.field" :header="header" :resource="header.resource"
            :options="header.options" @blur-context="setDirty(header.field)"
            @input="(value) => updateNested(header.field, value)" />
        </div>
        <div class="ml-2 mt-2 mr-auto error-container" v-if="header.type !== 'fieldset'">
          <slot name="errors" :status="deepPick(form_validation_status, header.field)" :field="header">
            <div v-if="deepPick(form_validation_status, header.field)" class="flex flex-col items-center">
              <span v-for="(error, index) in deepPick(
                form_validation_status,
                header.field
              ).errors" :key="index" class="mb-2 text-red-600">{{ error }}</span>
            </div>
          </slot>
        </div>
      </div>
      <div class="hidden">
        This is to prevent Tailwind Purge from removing col-span and row-span
        from CSS, since they are added to the code dynamically
        <div class="col-span-1 row-span-1" />
        <div class="col-span-2 row-span-2" />
        <div class="col-span-3 row-span-3" />
        <div class="col-span-4 row-span-4" />
        <div class="col-span-5 row-span-5" />
        <div class="col-span-6 row-span-6" />
        <div class="col-span-7 row-span-7" />
        <div class="col-span-8 row-span-8" />
        <div class="col-span-9 row-span-9" />
        <div class="col-span-10 row-span-10" />
        <div class="col-span-11 row-span-11" />
        <div class="col-span-12 row-span-12" />
      </div>
    </FormKit>
  </div>
</template>


<script setup>
import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from "vue";
import _ from "lodash";
import { PhInfo } from "@phosphor-icons/vue";
import Loading from './Loading.vue';
import { useTheme } from "../composables/useTheme.js";
import { helpers } from "../utils/helpers.js";
import { useCurrentUser } from "../composables/useCurrentUser.js";

defineOptions({ name: "AwesomeForm" });

const props = defineProps({
  id: { type: String, default: "aw-form" },
  debug: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
  form: { type: Object, required: true, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  validate: { type: Boolean, default: false },
  headers: { type: Array, required: true, default: () => [] },
  layout: { type: String, default: "vertical" },
  separatorClass: { type: String, default: null },
  labelClass: { type: String, default: null },
  inputClass: { type: String, default: null },
  fieldClass: { type: String, default: null },
});

const emit = defineEmits(["change", "valid"]);

const theme = useTheme();
const instance = getCurrentInstance();
const proxy = instance?.proxy;
const { getUserRole } = useCurrentUser();
const $editFields = proxy?.$editFields ?? {};
const apiClient = proxy?.$api;
const validators = proxy?.$validators ?? {};
const deepPickFn = proxy?.deepPick ?? helpers.deepPick;
const deepFindFn = proxy?.deepFind ?? helpers.deepFind;
const evaluateConditionFn = proxy?.evaluateCondition ?? helpers.evaluateCondition;
const momentLib = proxy?.moment ?? proxy?.$moment ?? helpers.moment;
const logFn = proxy?.log ?? console.log;
const forceComponentUpdate = () => proxy?.$forceUpdate?.();

const separatorClassValue = computed(() => props.separatorClass ?? theme.separatorClass);
const labelClassValue = computed(() => props.labelClass ?? theme.labelClass);
const fieldClassValue = computed(() => props.fieldClass ?? theme.fieldClass);

const updateHeaders = ref(Date.now());
const loading = ref(true);
const dataForm = reactive({});
const changedFields = reactive({});
const oldForm = ref({});
const userChoices = ref([]);
const form_options = reactive({});
const form_validation_status = reactive({});
const form_is_valid = ref(true);
const form_errors = reactive({});
const form_dirty_status = reactive({});

const scope = computed(() => (props.isEdit ? "edit" : "create"));

const logDebug = (...args) => {
  if (props.debug) {
    logFn(...args);
  }
};

const deepPick = (object, nestedField) => deepPickFn(object, nestedField);
const evaluateCondition = (condition, object, reference = null) =>
  evaluateConditionFn(condition, object, reference);
const moment = (...args) => momentLib(...args);

const visible_headers = computed(() => {
  updateHeaders.value;
  return props.headers.filter((header) => fieldIsVisible(header));
});

const assignDataForm = (form) => {
  let cloned = {};
  try {
    cloned = JSON.parse(JSON.stringify(form || {}));
  } catch (error) {
    cloned = {};
  }

  Object.keys(dataForm).forEach((key) => {
    delete dataForm[key];
  });

  Object.assign(dataForm, cloned);
};

onMounted(async () => {
  loading.value = true;
  logDebug(instance?.vnode?.key, "mounted", props.form);
  assignDataForm(props.form);
  await fetchOptions();
  updateOldForm(dataForm);
  validatedataForm();
  watchableOptions();
  loading.value = false;
});

const getUserRoleValue = () => getUserRole();

function setDirty(field) {
  _.set(form_dirty_status, field, true);
}

function getIdName(header) {
  if (header.type == "fieldset") {
    return header.label.toLowerCase().split(" ").join("-");
  }
  return header.code ? header.code.split(".").join("-") : "";
}

function watchableOptions() {
  const optionstoCheck = visible_headers.value.filter(
    (header) => header.type == "dynamicRadio" || header.type == "select"
  );

  optionstoCheck.forEach((header) => {
    let result = null;
    if (!header.options) {
      return;
    }

    Object.values(header.options)
      .filter((option) => {
        if (!option.visible) {
          return true;
        }

        let isOptionVisible = true;
        option.visible.forEach((condition) => {
          isOptionVisible = isOptionVisible && evaluateCondition(condition, dataForm);
        });
        return isOptionVisible;
      })
      .forEach((option) => {
        if (!result) {
          result = header.type == "dynamicRadio" ? {} : [];
        }

        if (header.type == "dynamicRadio") {
          result[option.value] = option.name;
        } else if (header.type == "select") {
          result.push(option);
        }
      });
    form_options[header.field] = result;
  });
}

function handleBooleanClick(header) {
  const currentValue = deepPick(dataForm, header.field);
  updateNested(header.field, !currentValue);
}

function updateFormulate(formulateForm) {
  Object.keys(formulateForm).forEach((fieldName) => {
    _.set(dataForm, fieldName, deepPick(formulateForm, fieldName));
  });

  updateOldForm(dataForm);
  validatedataForm();
  updateHeaders.value = Date.now();
  logDebug(instance?.vnode?.key, "update", dataForm);
}

function updateNested(field, value) {
  _.set(dataForm, field, value);
  setDirty(field);

  updateOldForm(dataForm);
  validatedataForm();

  updateHeaders.value = Date.now();
}

function parseDate(header) {
  return moment(dataForm[header.field], "YYYY-MM-DD").toDate();
}

function formatDate(newDate) {
  return moment(newDate).format("YYYY-MM-DD");
}

function forceUpdate() {
  updateHeaders.value = Date.now();
}

async function fetchOptions() {
  const promises = [];
  const selectCodes = [];

  props.headers.forEach((header) => {
    if (
      header.type === "select" ||
      header.isFetchable ||
      (header.select && header.type !== "dynamic-select")
    ) {
      if (
        (header.select && header.select.choices) ||
        (header.select && header.options)
      ) {
        form_options[header.select.code] = header.options || header.select.choices;
      } else {
        selectCodes.push(header.select.code);

        let url = header.select.url;
        if (header.select.of) {
          const value = deepFindFn(proxy, header.select.of);
          url = url.concat(`/${value}`);
        }

        if (header.select.type && header.select.type == "param") {
          promises.push(apiClient?.params ? apiClient.params(url) : Promise.resolve([]));
        } else {
          promises.push(apiClient?.list ? apiClient.list(url) : Promise.resolve([]));
        }
      }
    }

    if (header.type == "boolean") {
      updateNested(header.field, header.default ? header.default : false);
    }
  });

  const selectValues = await Promise.all(promises);

  selectValues.forEach((values, index) => {
    form_options[selectCodes[index]] = values;
  });

  forceComponentUpdate();
}

function validatedataForm() {
  if (!props.validate) return 0;
  if (!props.headers) return 0;
  if (!dataForm) return 0;

  form_is_valid.value = true;

  props.headers.forEach((header) => {
    if (header.type == "form") {
      return;
    }

    if (!fieldIsVisible(header)) {
      return;
    }

    const validationRules = header.validator || [];

    const validationStatus = {
      valid: true,
      errors: [],
      status: "validated",
    };

    validationRules.forEach((rule) => {
      const ruleTokens = rule.split(":");
      const ruleCode = ruleTokens[0];
      const ruleParams = ruleTokens[1] ? ruleTokens[1].split(",") : [];

      const fieldValue = deepPick(dataForm, header.field);

      let conditions = [];
      let currentValue;
      let otherValue;
      let fieldValueIsEmpty = false;

      switch (ruleCode) {
        case "required":
          switch (typeof fieldValue) {
            case "object":
              fieldValueIsEmpty = _.isEmpty(fieldValue);
              break;
            default:
              fieldValueIsEmpty = ["", undefined, null, NaN, false].includes(fieldValue);
              break;
          }

          if (fieldValueIsEmpty) {
            form_is_valid.value = false;
            validationStatus.valid = false;
            validationStatus.errors.push("Campo obbligatorio");
          }
          break;

        case "required_if":
          currentValue = fieldValue;
          otherValue = deepPick(dataForm, ruleParams[0]);

          if (otherValue) {
            switch (typeof fieldValue) {
              case "object":
                fieldValueIsEmpty = _.isEmpty(fieldValue);
                break;
              default:
                fieldValueIsEmpty = ["", undefined, null, NaN].includes(fieldValue);
                break;
            }

            if (fieldValueIsEmpty) {
              form_is_valid.value = false;
              validationStatus.valid = false;
              validationStatus.errors.push("Campo obbligatorio");
            }
          }
          break;

        case "equal":
          currentValue = fieldValue;
          otherValue = dataForm[ruleParams[0]];

          if ((!!currentValue || !!otherValue) && currentValue != otherValue) {
            form_is_valid.value = false;
            validationStatus.valid = false;
            validationStatus.errors.push("I due valori non corrispondono");
          }
          break;

        case "file_with_owner": {
          const fileObject = fieldValue;

          if (
            !_.isEmpty(fileObject) &&
            (_.isEmpty(fileObject.status) || _.isEmpty(fileObject.doc))
          ) {
            form_is_valid.value = false;
            validationStatus.valid = false;
            validationStatus.errors.push("Inserire documento e relativo stato");
          }
          break;
        }

        case "after_or_equal":
          conditions = [header.field, "AFTER_OR_EQUAL", ruleParams[0]];

          if (!evaluateCondition(conditions, dataForm, dataForm)) {
            const referencedHeader = visible_headers.value.find(
              (item) => `$${item.field}` == ruleParams[0]
            );

            const referencedHeaderName = referencedHeader
              ? referencedHeader.label
              : ruleParams[0];

            form_is_valid.value = false;
            validationStatus.validationStatus = false;
            validationStatus.errors.push(
              "La data deve essere maggiore o uguale a: " + referencedHeaderName
            );
          }
          break;

        case "after":
          conditions = [header.field, "AFTER", ruleParams[0]];

          if (!evaluateCondition(conditions, dataForm, dataForm)) {
            const referencedHeader = visible_headers.value.find(
              (item) => `$${item.field}` == ruleParams[0]
            );

            const referencedHeaderName = referencedHeader
              ? referencedHeader.label
              : ruleParams[0];

            form_is_valid.value = false;
            validationStatus.validationStatus = false;
            validationStatus.errors.push(
              "La data deve essere maggiore di: " + referencedHeaderName
            );
          }
          break;

        case "email":
          if (!validators.email?.(fieldValue)) {
            form_is_valid.value = false;
            validationStatus.valid = false;
            validationStatus.errors.push("Il campo email non è valido");
          }
          break;
        case "fiscal_code":
          if (!fieldValue) {
            break;
          }

          if (!validators.fiscal_code?.(fieldValue)) {
            form_is_valid.value = false;
            validationStatus.valid = false;
            validationStatus.errors.push("Il Codice Fiscale non è valido");
          }
          break;
        case "vat_number":
          if (!fieldValue) {
            break;
          }

          if (!validators.vat_number?.(fieldValue)) {
            form_is_valid.value = false;
            validationStatus.valid = false;
            validationStatus.errors.push("La Partita IVA non è valida");
          }
          break;
        case "min":
        case "max": {
          let comparator = ruleParams[0];

          if (comparator.charAt(0) == "$") {
            comparator = deepPick(
              dataForm,
              comparator.substring(1, comparator.length)
            );
          }

          logDebug(comparator, fieldValue);

          if (!comparator || !fieldValue) {
            break;
          }

          if (!validators[ruleCode]?.(fieldValue, comparator)) {
            form_is_valid.value = false;
            validationStatus.valid = false;
            validationStatus.errors.push(
              `Non puoi impostare un numero più ${ruleCode == "max" ? "alto" : "basso"} di: `,
              comparator
            );
          }
          break;
        }
        default: {
          const validator = validators[ruleCode];
          if (!validator) {
            break;
          }
          const { valid, message } = validator(fieldValue);
          if (!valid) {
            form_is_valid.value = false;
            validationStatus.valid = false;
            validationStatus.errors.push(message);
          }
          break;
        }
      }
    });

    if (deepPick(form_dirty_status, header.field)) {
      _.set(form_validation_status, header.field, validationStatus);
    }
  });

  emit("valid", form_is_valid.value);
}

function fieldIsVisible(header) {
  let isRoleVisible = true;
  let isFilterVisible = true;
  let isScopeVisible = true;

  if (header.roles) {
    isRoleVisible = header.roles.includes(getUserRoleValue());
  }

  if (header.visible) {
    header.visible.forEach((condition) => {
      isFilterVisible = isFilterVisible && evaluateCondition(condition, dataForm);
    });
  }

  if (header.scopes) {
    isScopeVisible = header.scopes.includes(scope.value);
  }

  return isRoleVisible && isFilterVisible && isScopeVisible;
}

function fieldIsReadonly(header) {
  if (props.readonly) {
    return true;
  }

  if (header.readonly == undefined) {
    return false;
  }

  if (typeof header.readonly === "boolean") {
    return header.readonly;
  }

  const mode = props.isEdit ? "edit" : "create";

  return header.readonly[mode] != undefined ? header.readonly[mode] : false;
}

function filterOptions(header) {
  if (!header.select) {
    return [];
  }

  if (header.options) {
    return header.options;
  }

  if (header.select && header.select.filter == undefined) {
    return form_options[header.select.code];
  }

  if (!form_options[header.select.code]) {
    return [];
  }

  let filteredOptions = form_options[header.select.code].filter((option) =>
    evaluateCondition(header.select.filter, option, dataForm)
  );

  if (props.debug) {
    logDebug(form_options);
    logDebug(header.select.code);
    logDebug(filteredOptions);
  }

  if (changedFields[header.select.filter[0]]) {
    dataForm[header.field] = undefined;
    changedFields[header.select.filter[0]] = false;
    forceComponentUpdate();
  }

  return filteredOptions;
}

function updateOldForm(newForm) {
  try {
    oldForm.value = JSON.parse(JSON.stringify(newForm || {}));
  } catch (error) {
    oldForm.value = {};
  }

  watchableOptions();
  emit("change", dataForm);
}

function getLabelClass(header) {
  let cssClass = "";

  switch (header.type) {
    case "form":
      cssClass = "text-gray-700 text-normal";
      break;

    case "fieldset":
      cssClass = separatorClassValue.value;
      break;

    default:
      cssClass = labelClassValue.value;
      break;
  }

  if (header.select && header.select.can_add) {
    cssClass += "";
  }

  return cssClass;
}

function formFieldClass(header) {
  let formFieldClass = fieldClassValue.value;
  let minColSpan;

  const layout = header.layout || props.layout;

  if (header.type) {
    formFieldClass += " " + header.type;
  }

  if (layout == "vertical") {
    formFieldClass += " grid grid-cols-3 flex flex-row items-center";
    minColSpan = 12;
  } else {
    const visibleCount = visible_headers.value.length || 1;
    formFieldClass += " flex flex-col";
    minColSpan = parseInt(12 / visibleCount);
  }

  if (header.type == "form") {
    formFieldClass += " border border-rounded-sm border-dotted border-gray-200";
  } else {
    const colSpan = header.colSpan || header.col_span || minColSpan;

    if (colSpan) {
      formFieldClass += ` col-span-${colSpan}`;
    }

    formFieldClass += " mb-3 " + (header.class ?? "");
    formFieldClass += " row-span-" + (header.rowSpan || 1);
  }

  return formFieldClass;
}

function setDependableVariables() {
  const dependableHeaders = props.headers.filter((header) => header.depends_on);

  dependableHeaders.forEach((header) => {
    const varToWatch = header.depends_on.var[0];

    watch(
      () => _.get(dataForm, varToWatch),
      (newValue) => {
        _.set(dataForm, header.field, header.depends_on.computed(newValue));
        updateHeaders.value = Date.now();
      },
      { deep: true }
    );
  });
}

function isLabelComponent(label) {
  if (!label) {
    return false;
  }

  if (_.isObject(label)) {
    return false;
  }

  const firstLetter = label.split("")[0];

  return firstLetter == "_";
}

function getLabelComponentName(label) {
  if (!label) {
    return false;
  }

  const firstLetter = label.split("")[0];
  if (firstLetter == "_") {
    return label.substring(1, label.length);
  }
}

const isObject = (value) => _.isObject(value);
</script>
<style></style>
