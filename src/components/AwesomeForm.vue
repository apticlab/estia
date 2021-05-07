<template>
  <div>
    <loading v-if="loading" />
    <FormulateForm
      v-if="!loading"
      name="aw-form"
      class="w-full grid grid-cols-12 col-gap-6"
      :values="form"
      @input="updateFormulate"
    >
      <pre v-if="debug">
        form: {{ dataForm }}
        valid: {{ form_is_valid }}
        visible_headers: {{ visible_headers.length }}
      </pre>
      <div
        v-for="(header, index) in visible_headers"
        :key="index"
        class="relative focus-within:text-blue"
        :class="formFieldClass(header)"
      >
        <label :class="getLabelClass(header)" :for="header.code">
          {{ header.label }}
          <span
            v-if="
              header.validator
                ? header.validator.indexOf('required') != -1
                : false
            "
            class="ml-1 font-bold text-orange-600"
            >*</span
          >
        </label>
        <div v-if="$editFields[header.type]">
          <component
            :is="$editFields[header.type]"
            :disabled="fieldIsReadonly(header)"
            :resources="filterOptions(header)"
            :header="header"
            :form-data="dataForm"
            :value="deepPick(dataForm, header.field)"
            @change="($event) => updateNested(header.field, $event)"
          />
        </div>
        <template v-else-if="header.field && header.field.includes('.')">
          <resource-select
            v-if="header.type == 'select'"
            :disabled="fieldIsReadonly(header)"
            :resources="filterOptions(header)"
            :header="header"
            :placeholder="header.placeholder"
            :value="deepPick(dataForm, header.field)"
            @change="($event) => updateNested(header.field, $event)"
          />
          <input
            v-if="header.type == 'text'"
            type="text"
            :value="deepPick(dataForm, header.field)"
            @input="($event) => updateNested(header.field, $event.target.value)"
          />
          <input
            v-if="header.type == 'number'"
            type="number"
            :value="deepPick(dataForm, header.field)"
            @input="($event) => updateNested(header.field, $event.target.value)"
          />
          <template v-if="header.type == 'boolean'">
            <label
              class="flex custom-label"
              @click="handleBooleanClick(header)"
            >
              <div
                class="flex items-center justify-center w-6 h-6 p-1 mr-2 bg-white shadow"
              >
                <svg
                  :class="!!deepPick(dataForm, header.field) ? '' : 'hidden'"
                  class="w-4 h-4 text-green-600 pointer-events-none"
                  viewBox="0 0 172 172"
                >
                  <g
                    fill="none"
                    stroke-width="none"
                    stroke-miterlimit="10"
                    font-family="none"
                    font-weight="none"
                    font-size="none"
                    text-anchor="none"
                    style="mix-blend-mode: normal"
                  >
                    <path d="M0 172V0h172v172z" />
                    <path
                      d="M145.433 37.933L64.5 118.8658 33.7337 88.0996l-10.134 10.1341L64.5 139.1341l91.067-91.067z"
                      fill="currentColor"
                      stroke-width="1"
                    />
                  </g>
                </svg>
              </div>
            </label>
          </template>
          <textarea
            v-if="header.type == 'textarea'"
            :value="deepPick(dataForm, header.field)"
            @input="($event) => updateNested(header.field, $event.target.value)"
          />
          <v-date-picker
            v-if="header.type == 'date'"
            locale="it"
            :min-date="header.minDate"
            :value="deepPick(dataForm, header.field)"
            @input="($event) => updateNested(header.field, formatDate($event))"
          >
            <template v-slot="{ inputValue, inputEvents }">
              <input :value="inputValue" v-on="inputEvents" />
            </template>
          </v-date-picker>
        </template>
        <div v-else="">
          <template v-if="header.type == 'form'">
            <awesome-form
              class="px-10 w-12/12"
              :form="dataForm[header.field]"
              :headers="header.headers"
              :validate="header.validate"
              @change="(value) => (dataForm[header.field] = value)"
            />
          </template>
          <template v-if="header.type == 'select'">
            <FormulateInput
              type="resource-select"
              class="flex-grow"
              :disabled="fieldIsReadonly(header)"
              :name="header.field"
              :resources="filterOptions(header)"
              :option-field="header.select.option"
              :placeholder="header.placeholder"
              :select="header.select"
            />
          </template>
          <template
            v-else-if="header.type == 'dynamic-select' || header.type == 'user'"
          >
            <FormulateInput
              :key="header.field"
              type="dynamic-select"
              :name="header.field"
              :header="header"
              :readonly="fieldIsReadonly(header)"
            />
          </template>
          <template v-else-if="header.type == 'balance'">
            <div class="flex">
              <FormulateInput
                :id="header.code"
                :key="header.field"
                type="number"
                :readonly="fieldIsReadonly(header)"
                :placeholder="header.placeholder"
                :name="header.field"
                class="flex-grow rounded-r-none"
              />
              <div
                class="flex items-center bg-gray-200 border border-l-0 border-gray-300 rounded rounded-l-none border-l-none"
              >
                <span class="px-3 text-gray-600">{{ header.udm }}</span>
              </div>
            </div>
          </template>
          <template v-else-if="header.type == 'boolean'">
            <label class="flex custom-label">
              <div
                class="flex items-center justify-center w-6 h-6 p-1 mr-2 bg-white shadow"
              >
                <FormulateInput
                  :id="header.code"
                  :readonly="fieldIsReadonly(header)"
                  type="checkbox"
                  class="hidden"
                  :name="header.field"
                />
                <svg
                  :class="!!deepFind(dataForm, header.field) ? '' : 'hidden'"
                  class="w-4 h-4 text-green-600 pointer-events-none"
                  viewBox="0 0 172 172"
                >
                  <g
                    fill="none"
                    stroke-width="none"
                    stroke-miterlimit="10"
                    font-family="none"
                    font-weight="none"
                    font-size="none"
                    text-anchor="none"
                    style="mix-blend-mode: normal"
                  >
                    <path d="M0 172V0h172v172z" />
                    <path
                      d="M145.433 37.933L64.5 118.8658 33.7337 88.0996l-10.134 10.1341L64.5 139.1341l91.067-91.067z"
                      fill="currentColor"
                      stroke-width="1"
                    />
                  </g>
                </svg>
              </div>
            </label>
          </template>
          <template v-else-if="header.type == 'image_upload'">
            <FormulateInput
              :id="header.code"
              :key="header.field"
              type="image-uploader"
              :readonly="fieldIsReadonly(header)"
              :placeholder="header.placeholder"
              :name="header.field"
            />
          </template>
          <FormulateInput
            v-else
            :id="header.code"
            :key="header.field"
            :readonly="fieldIsReadonly(header)"
            :type="header.type"
            :placeholder="header.placeholder"
            :name="header.field"
            :header="header"
            :resource="header.resource"
          />
        </div>
        <div class="ml-2 mt-2 mr-auto error-container">
          <div
            v-if="deepPick(form_validation_status, header.code)"
            class="flex flex-col items-center"
          >
            <span
              v-for="(error, index) in deepPick(
                form_validation_status,
                header.code
              ).errors"
              :key="index"
              class="mb-2 text-red-600"
              >{{ error }}</span
            >
          </div>
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
    </FormulateForm>
  </div>
</template>

<script>
import _ from "lodash";
import { mapState } from "vuex";

export default {
  name: "AwesomeForm",
  props: {
    debug: { required: false, default: false },
    isEdit: { required: false, default: false },
    form: { required: true, default: () => ({}) },
    readonly: { required: false, default: false },
    validate: { required: false, default: false },
    headers: { required: true, default: {} },
    layout: {
      required: false,
      default: "vertical",
      type: String,
    },
    separatorClass: {
      required: false,
      type: String,
      default() {
        return this.$theme.separatorClass;
      },
    },
    labelClass: {
      required: false,
      type: String,
      default() {
        return this.$theme.labelClass;
      },
    },
    inputClass: {
      required: false,
      type: String,
      default() {
        return this.$theme.inputClass;
      },
    },
    fieldClass: {
      required: false,
      type: String,
      default() {
        return this.$theme.fieldClass;
      },
    },
  },
  data() {
    return {
      updateHeaders: new Date().getTime(),
      loading: true,
      dataForm: {},
      changedFields: {},
      oldForm: {},
      userChoices: [],
      form_options: {},
      form_validation_status: {},
      form_is_valid: {},
      form_errors: {},
    };
  },
  async mounted() {
    this.loading = true;

    // Use a private clone so that we can
    // change it entirely to trigger some refresh
    let dataForm = JSON.parse(JSON.stringify(this.form));
    this.$set(this, "dataForm", dataForm);

    // load params for select field
    await this.fetchOptions();

    this.updateOldForm(this.dataForm);
    this.validatedataForm();

    this.setDependableVariables();

    this.loading = false;
  },
  beforeDestroy() {
    // this.event_bus.$off('aw:form:update', this.forceUpdate);
  },
  methods: {
    handleBooleanClick(header) {
      let currentValue = this.deepPick(this.dataForm, header.field);
      this.updateNested(header.field, !currentValue);
    },
    updateFormulate(formulateForm) {
      this.log('updateFormulate');
      // Merge data from Formulate and from our own nested two way bindings
      Object.keys(formulateForm).forEach((fieldName) => {
        this.$set(
          this.dataForm,
          fieldName,
          this.deepPick(formulateForm, fieldName)
        );
      });

      this.updateOldForm(this.dataForm);
      this.validatedataForm();
      this.updateHeaders = new Date().getTime();
      // this.$forceUpdate();
    },
    updateNested(field, value) {
      this.log('updateNested');
      _.set(this.dataForm, field, value);

      this.updateOldForm(this.dataForm);
      this.validatedataForm();

      this.updateHeaders = new Date().getTime();
      // this.$forceUpdate();
    },
    /**
     * deprecated
    listenForAwEvents() {
      this.event_bus.$on("aw:form:update", this.forceUpdate());
    }, */
    parseDate(header) {
      let parsedDate = this.moment(
        this.dataForm[header.field],
        "YYYY-MM-DD"
      ).toDate();

      return parsedDate;
    },
    formatDate(newDate) {
      return this.moment(newDate).format("YYYY-MM-DD");
    },
    forceUpdate() {
      this.updateHeaders = new Date().getTime();
    },
    async fetchOptions() {
      let promises = [];
      let selectCodes = [];

      this.visible_headers.forEach((header) => {
        if (header.type == "select" || header.isFetchable || header.select) {
          if (header.select && header.select.choices) {
            this.form_options[header.select.code] = header.select.choices;
          } else {
            selectCodes.push(header.select.code);

            let url = header.select.url;
            if (header.select.of) {
              url = url.concat(`/${this.deepFind(this, header.select.of)}`);
            }

            if (header.select.type && header.select.type == "param") {
              promises.push(this.$api.params(url));
            } else {
              promises.push(this.$api.list(url));
            }
          }
        }

        if (header.type == "boolean") {
          this.updateNested(
            this.dataForm,
            header.field,
            header.default ? header.default : false
          );
        }
      });

      let selectValues = await Promise.all(promises);

      selectValues.forEach((values, index) => {
        this.form_options[selectCodes[index]] = values;
      });

      this.$forceUpdate();
    },
    validatedataForm() {
      if (!this.validate) return 0;
      if (!this.headers) return 0;
      if (!this.dataForm) return 0;

      this.form_is_valid = true;

      this.headers.forEach((header) => {
        if (header.type == "form") {
          return;
        }

        if (!this.fieldIsVisible(header)) {
          return;
        }

        const validation_rules = header.validator || [];

        let validationStatus = {
          valid: true,
          errors: [],
          status: "validated",
        };

        validation_rules.forEach((rule) => {
          let ruleTokens = rule.split(":");

          let ruleCode = ruleTokens[0];
          let ruleParams = ruleTokens[1] ? ruleTokens[1].split(",") : [];

          let fieldValue = this.deepPick(this.dataForm, header.field);

          let conditions = [];

          let currentValue;
          let otherValue;

          switch (ruleCode) {
            case "required":
              let fieldValueIsEmpty = false;

              switch (typeof fieldValue) {
                case "object":
                  fieldValueIsEmpty = _.isEmpty(fieldValue);
                  break;
                default:
                  fieldValueIsEmpty = ["", undefined, null, NaN].includes(
                    fieldValue
                  );
                  break;
              }

              if (fieldValueIsEmpty) {
                this.form_is_valid = false;

                validationStatus.valid = false;
                validationStatus.errors.push("Campo obbligatorio");
              }
              break;

            case "required_if":
              currentValue = fieldValue;
              otherValue = this.deepPick(this.dataForm, ruleParams[0]);

              if (otherValue) {
                switch (typeof fieldValue) {
                  case "object":
                    fieldValueIsEmpty = _.isEmpty(fieldValue);
                    break;
                  default:
                    fieldValueIsEmpty = ["", undefined, null, NaN].includes(
                      fieldValue
                    );
                    break;
                }

                if (fieldValueIsEmpty) {
                  this.form_is_valid = false;

                  validationStatus.valid = false;
                  validationStatus.errors.push("Campo obbligatorio");
                }
              }
              break;

            case "equal":
              currentValue = fieldValue;
              otherValue = this.dataForm[ruleParams[0]];

              if (
                (!!currentValue || !!otherValue) &&
                currentValue != otherValue
              ) {
                this.form_is_valid = false;
                validationStatus.valid = false;
                validationStatus.errors.push("I due valori non corrispondono");
              }
              break;

            case "file_with_owner":
              let fileObject = fieldValue;

              if (
                !_.isEmpty(fileObject) &&
                (_.isEmpty(fileObject.status) || _.isEmpty(fileObject.doc))
              ) {
                this.form_is_valid = false;
                validationStatus.valid = false;
                validationStatus.errors.push(
                  "Inserire documento e relativo stato"
                );
              }
              break;

            case "after_or_equal":
              conditions = [header.field, "AFTER_OR_EQUAL", ruleParams[0]];

              if (
                !this.evaluateCondition(
                  conditions,
                  this.dataForm,
                  this.dataForm
                )
              ) {
                let referencedHeader = this.visible_headers.find((header) => {
                  return `\$${header.code}` == ruleParams[0];
                });

                let referencedHeaderName = referencedHeader
                  ? referencedHeader.label
                  : ruleParams[0];

                this.form_is_valid = false;
                validationStatus.validationStatus = false;
                validationStatus.errors.push(
                  "La data deve essere maggiore o uguale a: " +
                    referencedHeaderName
                );
              }
              break;

            case "after":
              conditions = [header.field, "AFTER", ruleParams[0]];

              if (
                !this.evaluateCondition(
                  conditions,
                  this.dataForm,
                  this.dataForm
                )
              ) {
                let referencedHeader = this.visible_headers.find((header) => {
                  // ruleParams[0] is in the form "$<name_of_target_input>"
                  return `\$${header.code}` == ruleParams[0];
                });

                let referencedHeaderName = referencedHeader
                  ? referencedHeader.label
                  : ruleParams[0];

                this.form_is_valid = false;
                validationStatus.validationStatus = false;
                validationStatus.errors.push(
                  "La data deve essere maggiore di: " + referencedHeaderName
                );
              }
              break;

            default:
              break;
          }
        });

        _.set(this.form_validation_status, header.code, validationStatus);
      });

      this.$emit("valid", this.form_is_valid);
    },
    fieldIsVisible(header) {
      let isRoleVisible = true;
      let isFilterVisible = true;
      let isScopeVisible = true;

      if (header.roles) {
        isRoleVisible = header.roles.includes(this.getUserRole());
      }

      if (header.visible) {
        header.visible.forEach((condition) => {
          isFilterVisible =
            isFilterVisible && this.evaluateCondition(condition, this.dataForm);
        });
      }

      if (header.scopes) {
        isScopeVisible = header.scopes.includes(this.scope);
      }

      return isRoleVisible && isFilterVisible && isScopeVisible;
    },
    fieldIsReadonly(header) {
      if (this.readonly) {
        return true;
      }

      if (header.readonly == undefined) {
        return false;
      }

      if (typeof header.readonly === "boolean") {
        return header.readonly;
      }

      let mode = this.isEdit ? "edit" : "create";

      // If it's false or not set I return false
      // otherwise I simply return the value
      return header.readonly[mode] != undefined ? header.readonly[mode] : false;
    },
    /**
     * deprecated 
    toObject(arr, header) {
      if (!arr) {
        return;
      }

      var rv = {};

      for (var i = 0; i < arr.length; ++i) {
        rv[arr[i].id] = this.deepPick(arr[i], header.select.option);
      }

      return rv;
    }, */
    filterOptions(header) {
      if (!header.select) {
        return [];
      }

      if (header.options) {
        return header.options;
      }

      if (header.select && header.select.filter == undefined) {
        return this.form_options[header.select.code];
      }

      if (!this.form_options[header.select.code]) {
        return [];
      }

      let filteredOptions = [];

      filteredOptions = this.form_options[header.select.code].filter(
        (option) => {
          let isInFilter = this.evaluateCondition(
            header.select.filter,
            option,
            this.dataForm
          );

          return isInFilter;
        }
      );

      if (this.debug) {
        this.log(this.form_options);
        this.log(header.select.code);
        this.log(filteredOptions);
      }

      if (this.changedFields[header.select.filter[0]]) {
        this.dataForm[header.field] = undefined;
        this.changedFields[header.select.filter[0]] = false;
        this.$forceUpdate();
      }

      return filteredOptions;
    },
    updateOldForm(newForm) {
      this.log('updateNested');
      this.oldForm = JSON.parse(JSON.stringify(newForm));
      
      // Update form for parent component
      this.$emit("change", this.dataForm);
    },
    getLabelClass(header) {
      let cssClass = "";

      switch (header.type) {
        case "form":
          cssClass = "text-gray-700 text-normal";
          break;

        case "fieldset":
          cssClass = this.separatorClass;
          break;

        default:
          cssClass = this.labelClass;
          break;
      }

      if (header.select) {
        if (header.select.can_add) {
          cssClass += "";
        }
      }

      return cssClass;
    },
    formFieldClass(header) {
      let formFieldClass = this.fieldClass;
      let minColSpan;

      let layout = header.layout || this.layout;

      if (layout == "vertical") {
        formFieldClass += " grid grid-cols-3 flex flex-row items-center";
        minColSpan = 12;
      } else {
        formFieldClass += " flex flex-col";
        minColSpan = parseInt(12 / this.visible_headers.length);
      }

      if (header.type == "form") {
        formFieldClass +=
          " border border-rounded-sm border-dotted border-gray-light";
      } else {
        formFieldClass += " mb-3 col-span-" + (header.colSpan || minColSpan);
        formFieldClass += " row-span-" + (header.rowSpan || 1);
      }

      return formFieldClass;
    },
    setDependableVariables() {
      let depandableHeaders = this.headers.filter(
        (header) => header.depends_on
      );

      for (let i = 0; i < depandableHeaders.length; i++) {
        let header = depandableHeaders[i];
        // fare il watch delle variabili presenti in var
        // eseguire la funzione computed passando le variabili presenti in var
        let varToWatch = header.depends_on.var[0];
        this.log(`oldForm.${varToWatch}`);

        // add the unwatch
        this.$watch(
          `dataForm.${varToWatch}`,
          (newV, oldV) => {
            this.log("changed form", newV, oldV);
            this.log(header.code, header.depends_on.computed(newV));
            this.$set(
              this.dataForm,
              header.code,
              header.depends_on.computed(newV)
            );
            this.updateHeaders = new Date().getTime();
          },
          { deep: true }
        );
      }
    },
  },
  computed: {
    ...mapState("user", {
      user: (state) => state.user,
    }),
    scope() {
      return this.isEdit ? "edit" : "create";
    },
    visible_headers() {
      let uh = this.updateHeaders;

      return this.headers.filter((header) => {
        return this.fieldIsVisible(header);
      });
    },
  },
  watch: {
   /*  form(newForm, oldForm) {
      console.log("Form watch");
      console.log(newForm);
      console.log(oldForm);
      if (_.isEmpty(newForm)) {
        console.log("Reset form");
        this.dataForm = {};
        this.$forceUpdate();
      }
    }, */
  },
};
</script>

<style></style>
