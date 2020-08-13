import Login from "@/components/Login.vue";
import Logout from "@/components/Logout.vue";

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
    name: "logout",
    path: "/logout",
    component: Logout
  }
];

export { routes };
