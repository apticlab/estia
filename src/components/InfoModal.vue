<template />
<script setup>
import { ref, watch, onMounted, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const instance = getCurrentInstance();
const $api = instance?.appContext.config.globalProperties.$api;
const EventBus = instance?.appContext.config.globalProperties.EventBus;
const moment = instance?.appContext.config.globalProperties.$moment;

const modalGoBack = ref(false);
const prevData = ref([]);
const isOpen = ref(false);
const template = ref('');
const data = ref({});
const isLoading = ref(false);
const fileUploaderText = ref('Importa');
const fileUploaderState = ref('import');
const fileUploaderCanDismiss = ref(true);
const isFileUploading = ref(false);
const chosenExportMethod = ref(null);
const results = ref('');
const status = ref('idle');
const importFile = ref('');
const skillUsersView = ref(false);
const skillTableView = ref(false);
const fileUploaderErrors = ref([]);

watch(isOpen, (newIsOpen) => {
  if (newIsOpen) {
    // initModal();
  }
});

const goBack = () => {
  isLoading.value = true;
  modalGoBack.value = false;
  data.value = JSON.parse(JSON.stringify(prevData.value.pop()));
  isLoading.value = false;
};

const closeFromOverlay = () => {
  if (status.value === 'success') {
    confirm(true);
  } else {
    confirm(false);
  }
};

const canSeeHow = (action) => {
  if (!action.action_type) {
    return false;
  }

  let actionTypeNameNormalized = action.action_type ? action.action_type : '';
  actionTypeNameNormalized = actionTypeNameNormalized.replace(/ /g, '');
  actionTypeNameNormalized = actionTypeNameNormalized.toLowerCase();

  return actionTypeNameNormalized === 'azionidasperimentare';
};

const confirm = (result) => {
  closeModal({
    result: result
  });
};

const actOnResource = () => {
  isLoading.value = true;

  $api
    ?.post(
      'resource/act/' +
        data.value.resourceName +
        '/' +
        data.value.resourceId +
        '/' +
        data.value.resourceAction,
      {
        data: data.value
      }
    )
    .then(
      (res) => {
        if (res.error) {
          status.value = 'error';
          data.value.errorText = res.error;
        } else {
          status.value = 'success';
        }

        isLoading.value = false;
      },
      (err) => {
        isLoading.value = false;
        data.value.errorText = err.response.data.message;
        status.value = 'error';
      }
    );
};

const saveNote = () => {
  var resourceMessage = {
    note: data.value.note,
    user: data.value.user,
    pda: data.value.pda || undefined,
    hr: data.value.user.hr,
    action: data.value.action
  };

  isLoading.value = true;

  $api?.create('resource/messages', resourceMessage).then(
    (res) => {
      isLoading.value = false;
      status.value = 'success';
    },
    (err) => {
      isLoading.value = false;
      status.value = 'error';
    }
  );
};

const enableUser = () => {
  isLoading.value = true;

  $api
    ?.post(
      'resource/act/' +
        data.value.resourceName +
        '/' +
        data.value.resourceId +
        '/enable_user',
      {
        data: data.value
      }
    )
    .then(
      (res) => {
        isLoading.value = false;
        status.value = 'success';
      },
      (err) => {
        isLoading.value = false;
        status.value = 'error';
      }
    );
};

const postponePDA = () => {
  isLoading.value = true;

  $api
    ?.post('pdas/hractions', {
      action: 'postpone_delivery_date',
      pda_id: data.value.pda.id,
      user_id: route.params.user_id,
      newDeliveryDate: moment?.(data.value.newDeliveryDate)
        .add(1, 'd')
        .toDate()
    })
    .then(
      (result) => {
        isLoading.value = false;
        status.value = 'success';
      },
      (err) => {
        console.log(err);
        isLoading.value = false;
        status.value = 'error';
      }
    );
};

const approveCoachingPlan = (approved) => {
  isLoading.value = true;

  data.value.approved = approved;

  let dataToSend = {
    approved: approved
  };

  $api
    ?.post(
      'resource/act/' +
        data.value.resourceName +
        '/' +
        data.value.resourceId +
        '/approve_teaching_agreement',
      {
        data: dataToSend
      }
    )
    .then(
      (res) => {
        data.value.successText = approved
          ? 'Patto di Coaching approvato con successo'
          : 'Richiesta di modifica inviata correttamente';
        isLoading.value = false;
        status.value = 'success';
      },
      (err) => {
        isLoading.value = false;
        status.value = 'error';
      }
    );
};

const resetPassword = () => {
  isLoading.value = true;

  $api
    ?.post(
      'resource/act/' +
        data.value.resourceName +
        '/' +
        data.value.resourceId +
        '/reset_password',
      {
        data: data.value
      }
    )
    .then(
      (res) => {
        data.value.new_password = res.new_password;

        isLoading.value = false;
        status.value = 'success';
      },
      (err) => {
        isLoading.value = false;
        status.value = 'error';
      }
    );
};

const initModal = () => {
  status.value = 'idle';
  chosenExportMethod.value = null;
  data.value = JSON.parse(JSON.stringify(data.value));
};

const exportChosenMethod = () => {
  closeModal({
    result: true,
    chosenExportMethod: chosenExportMethod.value
  });
};

const showSkillUsers = () => {
  skillUsersView.value = !skillUsersView.value;
};

const showTableView = (templateValue) => {
  skillTableView.value = !skillTableView.value;
};

const uploadCSV = (dismiss = false) => {
  switch (fileUploaderState.value) {
    case 'error':
      fileUploaderText.value = 'Importa';
      fileUploaderErrors.value = [];
      fileUploaderState.value = 'import';
      fileUploaderCanDismiss.value = true;
      importFile.value = null;
      break;

    case 'success':
      fileUploaderState.value = 'import';
      fileUploaderText.value = 'Importa';
      fileUploaderCanDismiss.value = true;
      importFile.value = null;
      confirm(true);
      break;

    case 'import':
      if (dismiss) {
        confirm(false);
        return;
      }

      isLoading.value = true;

      var formData = new FormData();

      formData.append('resources', importFile.value);
      formData.append('request_confirm', 'confirm');

      $api?.upload(formData, 'upload/' + data.value.resource).then(
        (result) => {
          isFileUploading.value = false;
          fileUploaderText.value = 'Conferma';
          fileUploaderState.value = 'confirm';
          fileUploaderCanDismiss.value = true;
          results.value = result;
          isLoading.value = false;
        },
        (err) => {
          isFileUploading.value = false;
          fileUploaderText.value = 'Riprova';
          fileUploaderCanDismiss.value = false;
          fileUploaderErrors.value = err.response.data;
          fileUploaderState.value = 'error';
          isLoading.value = false;
        }
      );

      break;

    case 'confirm':
      if (dismiss) {
        fileUploaderState.value = 'import';
        fileUploaderText.value = 'Importa';
        fileUploaderCanDismiss.value = true;
        importFile.value = null;
      } else {
        isLoading.value = true;

        var formDataConfirm = new FormData();

        formDataConfirm.append('resources', importFile.value);
        formDataConfirm.append('request_confirm', '');

        $api?.upload(formDataConfirm, 'upload/' + data.value.resource).then(
          (result) => {
            isFileUploading.value = false;
            fileUploaderText.value = 'Chiudi';
            fileUploaderState.value = 'success';
            fileUploaderCanDismiss.value = false;
            results.value = result;
            isLoading.value = false;
          },
          (err) => {
            isFileUploading.value = false;
            fileUploaderText.value = 'Riprova';
            fileUploaderCanDismiss.value = false;
            fileUploaderErrors.value = err.response.data;
            fileUploaderState.value = 'error';
            isLoading.value = false;
          }
        );
      }
      break;
  }
};

const sendMail = () => {
  isLoading.value = true;

  $api
    ?.post(
      'resource/act/' +
        data.value.resourceName +
        '/' +
        data.value.resourceId +
        '/send_custom_welcome_mail',
      {
        data: data.value
      }
    )
    .then(
      (res) => {
        isLoading.value = false;
        status.value = 'success';
      },
      (err) => {
        isLoading.value = false;
        status.value = 'error';
      }
    );
};

const closeModal = (dataValue) => {
  isOpen.value = false;
  EventBus?.emit('close-modal', dataValue);
};

const saveDate = () => {
  isLoading.value = true;

  $api
    ?.post(
      `resource/act/sessions/${
        data.value.resource.session_id
      }/choose_session_date`,
      {
        data: {
          choosen_date: data.value.resource.selectedDateIndex + 1
        }
      }
    )
    .then((res) => {
      isLoading.value = false;
      status.value = 'success';
    })
    .catch((err) => {
      data.value.err = err.error;
      isLoading.value = false;
      status.value = 'error';
    });
};

const deleteSession = () => {
  isLoading.value = true;

  $api
    ?.post(`resource/act/sessions/${data.value.resourceId}/cancel_session`, {
      data: {}
    })
    .then((res) => {
      isLoading.value = false;
      status.value = 'success';
    })
    .catch((err) => {
      data.value.err = err.error;
      isLoading.value = false;
      status.value = 'error';
    });
};

const postponeSession = () => {
  isLoading.value = true;

  $api
    ?.post(
      `resource/act/sessions/${data.value.resourceId}/postpone_session`,
      {
        data: {}
      }
    )
    .then((res) => {
      isLoading.value = false;
      status.value = 'success';
    })
    .catch((err) => {
      data.value.err = err.error;
      isLoading.value = false;
      status.value = 'error';
    });
};

onMounted(() => {
  EventBus?.on('modal-status-change', (dataValue) => {
    let statusValue = dataValue.status;

    switch (statusValue) {
      case 'loading':
        isLoading.value = true;
        break;
      case 'data-ready':
        data.value = dataValue.data;
        skillUsersView.value = false;
        skillTableView.value = false;
        isLoading.value = false;
        break;

      case 'next-data-ready':
        modalGoBack.value = true;
        prevData.value.push(JSON.parse(JSON.stringify(data.value)));
        data.value = dataValue.data;
        isLoading.value = false;
        break;
    }
  });

  EventBus?.on('modal-toggle', (config) => {
    isLoading.value = config.loading ? config.loading : false;

    initModal();

    isOpen.value = !isOpen.value;
    template.value = config.template;
    data.value = config.data;
  });

  status.value = 'idle';
});

// Expose methods for external use
defineExpose({
  goBack,
  closeFromOverlay,
  canSeeHow,
  confirm,
  actOnResource,
  saveNote,
  enableUser,
  postponePDA,
  approveCoachingPlan,
  resetPassword,
  initModal,
  exportChosenMethod,
  showSkillUsers,
  showTableView,
  uploadCSV,
  sendMail,
  closeModal,
  saveDate,
  deleteSession,
  postponeSession
});
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
