import Dialog from "@/plugins/dialog.js";
import Alert from "@/plugins/alert.js";
import VCalendar from "v-calendar";
import VueWindowSize from "vue-window-size";
import { VLazyImagePlugin } from "v-lazy-image";

export default function(app) {
  app.use(Dialog);
  app.use(Alert);
  app.use(VCalendar);
  app.use(VLazyImagePlugin);
  app.use(VueWindowSize);
}
