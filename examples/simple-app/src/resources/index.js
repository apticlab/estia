const resources = {
  test: {
    headers: [
      {
        type: "text",
        field: "name",
        label: "Nome",
        class: "justify-start",
      },
      {
        type: "text",
        field: "surname",
        label: "Cognome",
        class: "justify-center"
      }
    ],
    actions: [
      {
        name: "view",
        label: "Dettaglio",
        icon: "fa-view",
        callback: "view",
      }
    ],
    fields: [],
    config: {
      canAdd: true
    }
  }
};

export default resources;
