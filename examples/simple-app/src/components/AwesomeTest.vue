<template>
  <div>
    <h1>AwesomeForm test</h1>
    <awesome-form :form="form" :headers="headers"></awesome-form>
  </div>
</template>
<script>
export default {
  name: 'AwesomeTest',
  data() {
    return {
      form: {},
      headers: [
        {
          type: 'text',
          field: 'name',
          label: 'Nome',
          class: {
            header: 'justify-start text-left',
            row: 'justify-start text-left',
          },
        },
        {
          type: 'text',
          field: 'surname',
          label: 'Cognome',
          class: {
            header: 'justify-start text-left',
            row: 'justify-start text-left',
          },
        },
        {
          type: 'text',
          field: 'email',
          label: 'Email',
          class: {
            header: 'justify-start text-left',
            row: 'justify-start text-left',
          },
        },
        {
          type: 'text',
          field: 'role.name',
          label: 'Ruolo',
          class: {
            header: 'justify-start text-left',
            row: 'justify-start text-left',
          },
        },
      ],
    };
  },
  mounted() {
    this.log('Questo è il test del mixin logger');
  },
};
</script>
