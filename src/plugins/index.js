import Dialog from "@/plugins/dialog.js";
import Alert from "@/plugins/alert.js";
import VCalendar from "v-calendar";
import 'v-calendar/style.css';

export default function(app) {
  app.use(Dialog);
  app.use(Alert);
  app.use(VCalendar, {});
}
