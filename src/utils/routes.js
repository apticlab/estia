import Login from "@/components/Login";
import Logout from "@/components/Logout";

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
