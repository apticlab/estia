import Vue from "vue";
import App from "./App.vue";
import estia from "@apticlab/estia";

Vue.config.productionTip = false;

Vue.use(estia);

new Vue({
  render: h => h(App)
}).$mount("#app");
