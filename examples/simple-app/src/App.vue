<template>
  <div id="app">
    <h1>AwesomeForm test</h1>
    <awesome-form :form="form" :headers="headers"></awesome-form>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
  data() {
    return {
      form: {},
      headers: [
        {
          type: "text",
          field: "name",
          label: "Nome",
          class: {
            header: "justify-start text-left",
            row: "justify-start text-left",
          },
        },
        {
          type: "text",
          field: "surname",
          label: "Cognome",
          class: {
            header: "justify-start text-left",
            row: "justify-start text-left",
          },
        },
        {
          type: "text",
          field: "email",
          label: "Email",
          class: {
            header: "justify-start text-left",
            row: "justify-start text-left",
          },
        },
        {
          type: "text",
          field: "role.name",
          label: "Ruolo",
          class: {
            header: "justify-start text-left",
            row: "justify-start text-left",
          },
        },
      ],
    };
  },
  mounted() {
    this.log("Questo è il test del mixin logger");
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
