<template>
  <div :data-type="context.type" v-if="!loading">
    <survey :survey="survey"></survey>
  </div>
</template>

<script>
import * as SurveyVue from "survey-vue";
var Survey = SurveyVue.Survey;

import $ from "jquery";
import * as widgets from "surveyjs-widgets";
import { init as customWidget } from "@/utils/custom-widgets.js";

widgets.select2(SurveyVue);
widgets.inputmask(SurveyVue);
widgets.jquerybarrating(SurveyVue);
widgets.jqueryuidatepicker(SurveyVue);
widgets.nouislider(SurveyVue);
widgets.select2tagbox(SurveyVue);
widgets.sortablejs(SurveyVue);
widgets.ckeditor(SurveyVue);
widgets.autocomplete(SurveyVue);
widgets.bootstrapslider(SurveyVue);
customWidget(SurveyVue);

SurveyVue.Serializer.addProperty("question", "tag:number");
SurveyVue.StylesManager.applyTheme("modern");

export default {
  name: "resource-survey",
  components: {},
  props: {
    context: {
      type: Object,
      required: true
    },
    readonly: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      survey: null,
      loading: true,
      form: {}
    };
  },
  mounted() {
    this.loading = true;

    if (this.context.model) {
      this.context.model = JSON.parse(this.context.model); // dal db arriva come stringa
      this.survey = new SurveyVue.Model(this.clone(this.context.model));

      if (!this.context.model.data) {
        this.context.model["data"] = {};
      }

      // all'interno di data vengono inserite le risposte dell'utente
      this.survey.data = this.clone(this.context.model.data);

      if (this.readonly) {
        this.survey.mode = "display";
      }

      this.survey.showPreviewBeforeComplete = "showAllQuestions";
      this.survey.locale = "it";

      //this.survey.onValueChanging.add(this.saveChoices);

      //Use onValueChanged event to get a notification on chaning question value.
      this.survey.onValueChanged.add((sender, options) => {
        if (!options.value) {
          // evita che ci siano campi che come valore hanno una stringa vuota
          if (this.context.model.data[options.name]) {
            delete this.context.model.data[options.name];
          }
        }

        this.context.model.data[options.name] = options.value;
        this.survey.data = this.context.model.data;
      });

      //Use onComplete to get survey.data to pass it to the server.
      this.survey.onComplete.add(sender => {
        this.log("complete", sender);
        var mySurvey = sender;
        var surveyData = sender.data;
      });
    }

    this.loading = false;
  },
  methods: {},
  computed: {}
};
</script>
<style lang="scss">
.sv_complete_btn {
  @apply hidden;
}

.sv_nav,
.sv-footer {
  @apply hidden;
}

.sv_nav input[type="button"],
.sv_nav input[type="submit"],
.sv-footer .sv-btn {
  min-width: initial;
  float: initial;
  @apply ml-auto p-3 bg-blue transition duration-300 ease-in-out text-white items-center;
}

.sv-root-modern .sv-checkbox--checked .sv-checkbox__svg {
  @apply bg-blue;
}

.sv-root-modern .sv-question__title--answer {
  background-color: transparent;
}
.sv-root-modern .sv-container-modern__title {
  @apply text-gray-dark;
}

.sv-container-modern__title {
  @apply pt-3;
}

.sv-multipletext {
  border-collapse: separate;
  border-spacing: 0 15px;
}
.sv-multipletext__row {
  @apply my-8;
}
.sv-multipletext__cell:not(:last-child) {
  @apply pr-10;
}

.sv-text,
.sv-comment {
  height: initial !important;
  border: 2px solid;
  border-width: 2px;
  --border-opacity: 1;
  border-color: #d5d5d5 !important;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  --bg-opacity: 1;
  background-color: #fff;
  --text-opacity: 1;
  color: #212121;
  display: block;
  outline: 0;
}

.sv-body__page,
.sv-body__footer,
.sv-container-modern__title {
  @apply m-0;
}
</style>
