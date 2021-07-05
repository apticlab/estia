import Dialog from "@/plugins/dialog.js";
import Alert from "@/plugins/alert.js";
import VCalendar from "v-calendar";
import VueWindowSize from "vue-window-size";
import { VLazyImagePlugin } from "v-lazy-image";

export default function(Vue) {
  Vue.use(Dialog);
  Vue.use(Alert);
  Vue.use(VCalendar);
  Vue.use(VLazyImagePlugin);
  Vue.use(VueWindowSize);
}
