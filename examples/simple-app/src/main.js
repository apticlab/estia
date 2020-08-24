import Vue from "vue";
import App from "./App.vue";
import estia from "@apticlab/estia";
import VueRouter from "vue-router";
import Vuex from 'vuex'

import { innerRoutes, outerRoutes, noAuthRouteList } from './router/routes.js';
import baseComponents from './components';
import './assets/css/app.css';
import resources from './resources';
import testResources from './resources/test.resources';

Vue.use(VueRouter);
const router = new VueRouter({
  mode: "history",
});

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {}
})

Vue.config.productionTip = false;

console.log(testResources);
console.log(resources);

Vue.use(estia, {
  resources,
  router,
  store,
  innerRoutes,
  outerRoutes,
  noAuthRouteList,
  baseComponents
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
