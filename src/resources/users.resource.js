const users = {
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
  actions: [
    {
      label: 'Dettaglio',
      icon: 'ti-eye',
      class: 'hover:text-blue-600',
      callback: 'view',
      roles: ['superadmin'],
    },
    {
      label: 'Modifica',
      icon: 'ti-pencil',
      class: 'hover:text-orange-600',
      callback: 'edit',
      roles: ['superadmin'],
    },
    {
      label: 'Elimina',
      icon: 'ti-trash',
      class: 'hover:text-red-600',
      callback: 'delete',
      roles: ['superadmin'],
    },
  ],
  fields: [
    {
      type: 'image_upload',
      code: 'avatar',
      field: 'avatar',
      label: '',
      colSpan: 3,
      rowSpan: 2,
      placeholder: '',
      validator: [],
    },
    {
      type: 'select',
      select: {
        code: 'roles',
        url: 'roles',
        option: 'name',
      },
      readonly: {
        edit: true,
      },
      code: 'role',
      label: 'Ruolo',
      placeholder: 'Inserisci il ruolo di cliente',
      validator: ['required'],
      field: 'role',
    },
    {
      type: 'text',
      code: 'name',
      field: 'name',
      label: 'Nome',
      placeholder: 'Inserisci il nome',
      validator: ['required'],
    },
    {
      type: 'text',
      code: 'surnname',
      field: 'surname',
      label: 'Cognome',
      placeholder: 'Inserisci il Cognome',
      validator: ['required'],
    },
    {
      type: 'email',
      field: 'email',
      label: 'Email',
      code: 'email',
      placeholder: "Inserisci l'indirizzo email",
      validator: ['required'],
    },
    {
      type: 'text',
      code: 'birth_place',
      field: 'birth_place',
      label: 'Luogo Nascita',
      placeholder: 'Inserisci il luogo di nascita',
      validator: ['required'],
    },
    {
      type: 'date',
      code: 'birth_date',
      field: 'birth_date',
      label: 'Data di nascita',
      placeholder: '',
      validator: ['required'],
    },
    {
      type: 'select',
      select: {
        code: 'citizenships',
        url: 'citizenships',
        option: 'state',
      },
      code: 'citizenships',
      label: 'Cittadinanza',
      placeholder: 'Inserisci la cittadinanza',
      validator: [],
      field: 'citizenship',
    },
  ],
};

export { users };
