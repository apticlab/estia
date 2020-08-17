import Vue from "vue";
import App from "./App.vue";
import estia from "@apticlab/estia";
import VueRouter from "vue-router";

import routes from './router/routes.js';

import './assets/css/app.css';

const router = new VueRouter({
  mode: "history",
});

Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.use(estia, {
  router
});

console.log(routes);

router.addRoutes(routes);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
