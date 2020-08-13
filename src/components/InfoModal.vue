<template> </template>
<script>
import { api } from "../utils/api.js";

export default {
  name: "InfoModal",
  /*
  props: {
    isOpen: { default: false, required: true },
    template: { default: "", required: true, type: String },
    resource: { default: "", required: false, type: String },
    resourceName: { default: "", required: false, type: String },
    data: {},
  },
   */
  data() {
    return {
      modalGoBack: false,
      prevData: [],
      isOpen: false,
      template: "",
      data: {},
      isLoading: false,
      fileUploaderText: "Importa",
      fileUploaderState: "import",
      fileUploaderCanDismiss: true,
      isFileUploading: false,
      chosenExportMethod: null,
      results: "",
      status: "idle",
      importFile: "",
      skillUsersView: false,
      skillTableView: false
    };
  },
  mounted: function() {
    this.EventBus.$on("modal-status-change", data => {
      let status = data.status;

      switch (status) {
        case "loading":
          this.isLoading = true;
          break;
        case "data-ready":
          this.data = data.data;
          this.skillUsersView = false;
          this.skillTableView = false;
          this.isLoading = false;
          break;

        case "next-data-ready":
          this.modalGoBack = true;
          this.prevData.push(JSON.parse(JSON.stringify(this.data)));
          this.data = data.data;
          this.isLoading = false;
          break;
      }
    });

    this.EventBus.$on("modal-toggle", config => {
      this.isLoading = config.loading ? config.loading : false;

      this.initModal();

      this.isOpen = !this.isOpen;
      this.template = config.template;
      this.data = config.data;
    });

    this.status = "idle";
  },
  watch: {
    isOpen: function(isOpen) {
      if (isOpen) {
        //this.initModal();
      }
    }
  },
  methods: {
    goBack: function() {
      this.isLoading = true;
      this.modalGoBack = false;
      this.data = JSON.parse(JSON.stringify(this.prevData.pop()));
      this.isLoading = false;
    },
    closeFromOverlay: function() {
      if (this.status == "success") {
        this.confirm(true);
      } else {
        this.confirm(false);
      }
    },
    canSeeHow: function(action) {
      if (!action.action_type) {
        return false;
      }

      let actionTypeNameNormalized = action.action_type
        ? action.action_type
        : "";

      actionTypeNameNormalized = actionTypeNameNormalized.replace(/ /g, "");
      actionTypeNameNormalized = actionTypeNameNormalized.toLowerCase();

      return actionTypeNameNormalized == "azionidasperimentare";
    },
    confirm: function(result) {
      this.closeModal({
        result: result
      });
    },
    actOnResource: function() {
      this.isLoading = true;

      api
        .post(
          "resource/act/" +
            this.data.resourceName +
            "/" +
            this.data.resourceId +
            "/" +
            this.data.resourceAction,
          {
            data: this.data
          }
        )
        .then(
          res => {
            if (res.error) {
              this.status = "error";
              this.data.errorText = res.error;
            } else {
              this.status = "success";
            }

            this.isLoading = false;
          },
          err => {
            this.isLoading = false;
            this.data.errorText = err.response.data.message;
            this.status = "error";
          }
        );
    },
    saveNote: function() {
      var resourceMessage = {
        note: this.data.note,
        user: this.data.user,
        pda: this.data.pda || undefined,
        hr: this.data.user.hr,
        action: this.data.action
      };

      this.isLoading = true;

      api.create("resource/messages", resourceMessage).then(
        res => {
          this.isLoading = false;
          this.status = "success";
        },
        err => {
          this.isLoading = false;
          this.status = "error";
        }
      );
    },
    enableUser() {
      this.isLoading = true;

      api
        .post(
          "resource/act/" +
            this.data.resourceName +
            "/" +
            this.data.resourceId +
            "/enable_user",
          {
            data: this.data
          }
        )
        .then(
          res => {
            this.isLoading = false;
            this.status = "success";
          },
          err => {
            this.isLoading = false;
            this.status = "error";
          }
        );
    },
    postponePDA: function() {
      this.isLoading = true;

      api
        .post("pdas/hractions", {
          action: "postpone_delivery_date",
          pda_id: this.data.pda.id,
          user_id: this.$route.params.user_id,
          newDeliveryDate: this.moment(this.data.newDeliveryDate)
            .add(1, "d")
            .toDate()
        })
        .then(
          result => {
            this.isLoading = false;
            this.status = "success";
          },
          err => {
            console.log(err);
            this.isLoading = false;
            this.status = "error";
          }
        );
    },
    approveCoachingPlan: function(approved) {
      this.isLoading = true;

      this.data.approved = approved;

      let dataToSend = {
        approved: approved
      };

      api
        .post(
          "resource/act/" +
            this.data.resourceName +
            "/" +
            this.data.resourceId +
            "/approve_teaching_agreement",
          {
            data: dataToSend
          }
        )
        .then(
          res => {
            this.data.successText = approved
              ? "Patto di Coaching approvato con successo"
              : "Richiesta di modifica inviata correttamente";
            this.isLoading = false;
            this.status = "success";
          },
          err => {
            this.isLoading = false;
            this.status = "error";
          }
        );
    },
    resetPassword() {
      this.isLoading = true;

      api
        .post(
          "resource/act/" +
            this.data.resourceName +
            "/" +
            this.data.resourceId +
            "/reset_password",
          {
            data: this.data
          }
        )
        .then(
          res => {
            this.data.new_password = res.new_password;

            this.isLoading = false;
            this.status = "success";
          },
          err => {
            this.isLoading = false;
            this.status = "error";
          }
        );
    },
    initModal() {
      this.status = "idle";
      this.chosenExportMethod = null;
      this.data = JSON.parse(JSON.stringify(this.data));
    },
    exportChosenMethod() {
      this.closeModal({
        result: true,
        chosenExportMethod: this.chosenExportMethod
      });
    },
    showSkillUsers: function() {
      this.skillUsersView = !this.skillUsersView;
    },
    showTableView: function(template) {
      this.skillTableView = !this.skillTableView;
    },
    uploadCSV: function(dismiss = false) {
      switch (this.fileUploaderState) {
        case "error":
          this.fileUploaderText = "Importa";
          this.fileUploaderErrors = [];
          this.fileUploaderState = "import";
          this.fileUploaderCanDismiss = true;
          this.importFile = null;
          break;

        case "success":
          this.fileUploaderState = "import";
          this.fileUploaderText = "Importa";
          this.fileUploaderCanDismiss = true;
          this.importFile = null;
          this.confirm(true);
          break;

        case "import":
          if (dismiss) {
            this.confirm(false);
            return;
          }

          this.isLoading = true;

          var formData = new FormData();

          formData.append("resources", this.importFile);
          formData.append("request_confirm", "confirm");

          api.upload(formData, "upload/" + this.data.resource).then(
            function(result) {
              this.isFileUploading = false;
              this.fileUploaderText = "Conferma";
              this.fileUploaderState = "confirm";
              this.fileUploaderCanDismiss = true;
              this.results = result;
              this.isLoading = false;
            }.bind(this),
            function(err) {
              this.isFileUploading = false;
              this.fileUploaderText = "Riprova";
              this.fileUploaderCanDismiss = false;
              this.fileUploaderErrors = err.response.data;
              this.fileUploaderState = "error";
              this.isLoading = false;
            }.bind(this)
          );

          break;

        case "confirm":
          if (dismiss) {
            this.fileUploaderState = "import";
            this.fileUploaderText = "Importa";
            this.fileUploaderCanDismiss = true;
            this.importFile = null;
          } else {
            this.isLoading = true;

            var formData = new FormData();

            formData.append("resources", this.importFile);
            formData.append("request_confirm", "");

            api.upload(formData, "upload/" + this.data.resource).then(
              function(result) {
                this.isFileUploading = false;
                this.fileUploaderText = "Chiudi";
                this.fileUploaderState = "success";
                this.fileUploaderCanDismiss = false;
                this.results = result;
                this.isLoading = false;
              }.bind(this),
              function(err) {
                this.isFileUploading = false;
                this.fileUploaderText = "Riprova";
                this.fileUploaderCanDismiss = false;
                this.fileUploaderErrors = err.response.data;
                this.fileUploaderState = "error";
                this.isLoading = false;
              }.bind(this)
            );
          }
          break;
      }
    },
    sendMail: function() {
      this.isLoading = true;

      api
        .post(
          "resource/act/" +
            this.data.resourceName +
            "/" +
            this.data.resourceId +
            "/send_custom_welcome_mail",
          {
            data: this.data
          }
        )
        .then(
          res => {
            this.isLoading = false;
            this.status = "success";
          },
          err => {
            this.isLoading = false;
            this.status = "error";
          }
        );
    },
    closeModal(data) {
      this.isOpen = false;
      this.EventBus.$emit("close-modal", data);
    },
    saveDate() {
      this.isLoading = true;

      api
        .post(
          `resource/act/sessions/${this.data.resource.session_id}/choose_session_date`,
          {
            data: {
              choosen_date: this.data.resource.selectedDateIndex + 1
            }
          }
        )
        .then(res => {
          this.isLoading = false;
          this.status = "success";
        })
        .catch(err => {
          this.data.err = err.error;
          this.isLoading = false;
          this.status = "error";
        });
    },
    deleteSession() {
      this.isLoading = true;

      api
        .post(`resource/act/sessions/${this.data.resourceId}/cancel_session`, {
          data: {}
        })
        .then(res => {
          this.isLoading = false;
          this.status = "success";
        })
        .catch(err => {
          this.data.err = err.error;
          this.isLoading = false;
          this.status = "error";
        });
    },
    postponeSession() {
      this.isLoading = true;

      api
        .post(
          `resource/act/sessions/${this.data.resourceId}/postpone_session`,
          {
            data: {}
          }
        )
        .then(res => {
          this.isLoading = false;
          this.status = "success";
        })
        .catch(err => {
          this.data.err = err.error;
          this.isLoading = false;
          this.status = "error";
        });
    }
  }
};
</script>
<style>
.show-skill-graph {
  height: 90% !important;
  width: 80% !important;
}

.mail {
  width: 50% !important;
}

.export_buttons {
  color: #888;
  width: 300px;
  height: 300px;
  border-color: #efefef;
  background-color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.export_buttons.selected {
  background-color: #00525a;
  color: white;
}

.export_buttons > div {
  font-size: 1.4rem;
}

.export_buttons > div i {
  font-size: 1.6rem;
  margin-bottom: 15px;
}
</style>
