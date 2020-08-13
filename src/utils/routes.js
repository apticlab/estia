import Login from "@/components/Login";
import Logout from "@/components/Logout";

import Main from "@/views/Main";
import RouterView from "@/views/RouterView";
import ListResources from "@/views/ListResources";
import EditResource from "@/views/EditResource";
import ViewResource from "@/views/ViewResource";
import TabView from "@/views/TabView";
import CalendarView from "@/views/Calendar";

import ListMission from "@/views/ListMission";
import ViewMission from "@/views/ViewMission";

import { getProfile } from "../utils/auth.js";

const roleRedirect = {
  superadmin: "/reports"
};

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: "/",
    name: "root",
    meta: {
      requiresAuth: true
    },
    component: Main,
    children: [
      {
        path: "/providers",
        name: "providers",
        component: RouterView,
        meta: {
          label: "Provider",
          icon: "ti-user",
          roles: ["superadmin"]
        },
        children: [
          {
            path: "list",
            component: ListResources,
            meta: {
              resource: "providers"
            }
          },
          {
            path: "create",
            component: EditResource,
            meta: {
              resource: "providers"
            }
          },
          {
            path: "edit/:id",
            component: EditResource,
            meta: {
              resource: "providers"
            }
          },
          {
            path: "view/:id",
            component: ViewResource,
            meta: {
              resource: "providers"
            }
          },
          {
            path: "",
            redirect: "list"
          }
        ]
      },
      {
        path: "/missions",
        name: "missions",
        component: RouterView,
        meta: {
          label: "Missioni",
          icon: "ti-bolt",
          roles: [
            "superadmin",
            "user_provider",
            "officer",
            "company_manager",
            "site_manager"
          ]
        },
        children: [
          {
            path: "list",
            component: ListMission,
            meta: {
              label: "Missioni",
              resource: "missions"
            }
          },
          {
            path: "create",
            component: EditResource,
            meta: {
              label: "Crea Missione",
              resource: "missions"
            }
          },
          {
            path: "edit/:id",
            component: EditResource,
            meta: {
              label: "Modifica Missione",
              resource: "missions"
            }
          },
          {
            path: "view/:id",
            component: ViewMission,
            meta: {
              label: "Dettaglio Missione",
              resource: "missions"
            }
          },
          {
            path: "",
            redirect: "list"
          }
        ]
      },
      {
        path: "/calendar",
        name: "calendar",
        component: CalendarView,
        meta: {
          label: "Calendario",
          icon: "ti-calendar",
          roles: [
            "superadmin",
            "user_provider",
            "officer",
            "company_manager",
            "site_manager"
          ]
        }
      },
      {
        path: "/companies",
        name: "companies",
        component: RouterView,
        meta: {
          label: "Aziende",
          icon: "ti-briefcase",
          roles: ["superadmin", "user_provider", "company_manager"]
        },
        children: [
          {
            path: "list",
            component: ListResources,
            meta: {
              resource: "companies"
            }
          },
          {
            path: "create",
            component: EditResource,
            meta: {
              resource: "companies",
              label: "Nuova Azienda"
            }
          },
          {
            path: "edit/:id",
            component: EditResource,
            meta: {
              resource: "companies",
              label: "Modifica Azienda"
            }
          },
          {
            path: "view/:id",
            component: ViewResource,
            meta: {
              resource: "companies",
              label: "Dettaglio Azienda"
            }
          },
          {
            path: "",
            redirect: "list"
          }
        ]
      },
      {
        path: "/site_managers",
        name: "site_managers",
        component: RouterView,
        meta: {
          icon: "ti-user",
          roles: ["superadmin", "user_provider"]
        },
        children: [
          {
            path: "create",
            component: EditResource,
            meta: {
              label: "Nuovo Responsabile Sito",
              resource: "site_managers"
            }
          },
          {
            path: "edit/:id",
            component: EditResource,
            meta: {
              label: "Modifica Responsabile Sito",
              resource: "site_managers"
            }
          },
          {
            path: "view/:id",
            component: ViewResource,
            meta: {
              label: "Dettaglio Responsabile Sito",
              resource: "site_managers"
            }
          }
        ]
      },
      {
        path: "/company_managers",
        name: "company_managers",
        component: RouterView,
        meta: {
          icon: "ti-user",
          roles: ["superadmin", "user_provider"]
        },
        children: [
          {
            path: "create",
            component: EditResource,
            meta: {
              label: "Nuovo Responsabile Azienda",
              resource: "company_managers"
            }
          },
          {
            path: "edit/:id",
            component: EditResource,
            meta: {
              label: "Modifica Responsabile Azienda",
              resource: "company_managers"
            }
          },
          {
            path: "view/:id",
            component: ViewResource,
            meta: {
              label: "Dettaglio Responsabile Azienda",
              resource: "company_managers"
            }
          }
        ]
      },
      {
        path: "/officers",
        name: "officers",
        component: RouterView,
        meta: {
          roles: ["superadmin", "user_provider"]
        },
        children: [
          {
            path: "create",
            component: EditResource,
            meta: {
              resource: "officers"
            }
          },
          {
            path: "edit/:id",
            component: EditResource,
            meta: {
              label: "Modifica Addetto alla Sicurezza",
              resource: "officers"
            }
          },
          {
            path: "view/:id",
            component: ViewResource,
            meta: {
              label: "Dettaglio Addetto alla Sicurezza",
              resource: "officers"
            }
          }
        ]
      },
      {
        path: "/users",
        name: "users",
        component: TabView,
        meta: {
          label: "Utenti",
          icon: "ti-user",
          roles: ["superadmin", "user_provider", "company_manager"],
          tabs: [
            {
              label: "Responsabili Azienda",
              code: "company_managers",
              url: "companymanagers",
              roles: ["superadmin", "user_provider"]
            },
            {
              label: "Responsabili Sito",
              code: "site_managers",
              url: "site_managers",
              roles: ["superadmin", "user_provider", "company_manager"]
            },
            {
              label: "Addetti alla Sicurezza",
              code: "officers",
              url: "officers",
              roles: ["superadmin", "user_provider", "company_manager"]
            },
            {
              label: "Utenti Provider",
              code: "user_providers",
              url: "user_providers",
              roles: ["superadmin"]
            }
          ]
        },
        children: [
          {
            path: ":resource/list",
            component: ListResources
          },
          {
            path: ":resource/view/:id",
            component: ViewResource
          },
          {
            path: ":resource/edit/:id",
            component: EditResource
          },
          {
            path: ":resource/create",
            component: EditResource
          }
        ]
      },
      {
        path: "/checklists",
        name: "checklists",
        component: RouterView,
        meta: {
          label: "Checklist",
          icon: "ti-menu-alt",
          roles: ["superadmin", "user_provider"]
        },
        children: [
          {
            path: "list",
            component: ListResources,
            meta: {
              label: "Lista Checklist",
              resource: "checklists"
            }
          },
          {
            path: "create",
            component: EditResource,
            meta: {
              label: "Crea Checklist",
              resource: "checklists"
            }
          },
          {
            path: "edit/:id",
            component: EditResource,
            meta: {
              label: "Modifica Checklist",
              resource: "checklists"
            }
          },
          {
            path: "view/:id",
            component: ViewResource,
            meta: {
              label: "Dettaglio Checklist",
              resource: "checklists"
            }
          },
          {
            path: "",
            redirect: "list"
          }
        ]
      },
      {
        path: "/reports",
        name: "reports",
        component: RouterView,
        meta: {
          label: "Report",
          icon: "ti-bar-chart",
          roles: ["superadmin", "user_provider"]
        },
        children: [
          {
            path: "list",
            component: ListResources,
            meta: {
              resource: "reports"
            }
          },
          {
            path: "create",
            component: EditResource,
            meta: {
              resource: "officers"
            }
          },
          {
            path: "edit/:id",
            component: EditResource,
            meta: {
              resource: "officers"
            }
          },
          {
            path: "view/:id",
            component: RouterView,
            meta: {
              resource: "users"
            }
          },
          {
            path: "",
            redirect: "list"
          }
        ]
      },
      {
        path: "/survey",
        name: "survey",
        component: RouterView,
        meta: {
          roles: ["superadmin", "user_provider", "officer"]
        },
        children: [
          {
            path: "edit/:id",
            component: EditResource,
            meta: {
              label: "Compila Checklist",
              resource: "survey"
            }
          },
          {
            path: "view/:id",
            component: ViewResource,
            meta: {
              label: "Dettaglio Checklist",
              resource: "survey"
            }
          }
        ]
      },
      {
        path: "/settings",
        name: "settings",
        component: RouterView,
        meta: {
          label: "Impostazioni",
          icon: "ti-settings",
          roles: [
            "superadmin",
            "user_provider",
            "officer",
            "company_manager",
            "site_manager"
          ]
        },
        children: [
          {
            path: "list",
            component: RouterView,
            meta: {}
          },
          {
            path: "",
            redirect: "list"
          }
        ]
      },
      {
        name: "logout",
        path: "/logout",
        component: Logout
      },
      {
        path: "",
        redirect: to => {
          let user = getProfile();

          if (!user) {
            return "/login";
          }

          return roleRedirect[user.role.code] || "/missions";
        }
      }
    ]
  }
];

export { routes };
