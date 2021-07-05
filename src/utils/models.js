var users = [
  {
    id: 0,
    name: "Utente",
    surname: "Prova"
  },
  {
    id: 1,
    name: "Utente2",
    surname: "Prova"
  },
  {
    id: 2,
    name: "Utente3",
    surname: "Prova"
  }
];

var pdas = [
  [
    {
      id: 17,
      skill: {
        name: "Gestione della squadra"
      },
      status: "accepted",
      quality_index: "80",
      execution_index: "0",
      initial_rating: 2,
      expected_rating: 4,
      timing: {
        description: "12 mesi"
      }
    },
    {
      id: 16,
      skill: {
        name: "Networking"
      },
      status: "idle",
      quality_index: "80",
      execution_index: "0",
      initial_rating: 2,
      expected_rating: 4,
      timing: {
        description: "12 mesi"
      }
    }
  ],
  [
    {
      id: 17,
      skill: {
        name: "Accuratezza e qualità"
      },
      status: "accepted",
      quality_index: "100",
      execution_index: "40",
      initial_rating: 2,
      expected_rating: 4,
      timing: {
        description: "12 mesi"
      }
    }
  ],
  [
    {
      id: 17,
      skill: {
        name: "Adattabilità e flessibilità"
      },
      status: "idle",
      quality_index: "30",
      execution_index: "0",
      initial_rating: 2,
      expected_rating: 4,
      timing: {
        description: "12 mesi"
      }
    }
  ]
];

var teams = [[1, 2, 3]];

const models = {
  users: users,
  pdas: pdas,
  teams: teams
};

export { models };
