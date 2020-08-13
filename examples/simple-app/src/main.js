import Vue from "vue";
import App from "./App.vue";
import estia from "@apticlab/estia";
import router from "vue-router";

Vue.config.productionTip = false;

Vue.use(estia, {
  router
});

new Vue({
  render: h => h(App)
}).$mount("#app");
