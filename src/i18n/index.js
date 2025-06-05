import { createI18n } from "vue-i18n";
import locales from "./locales";

const translations = createI18n({
  locale: "it",
  messages: locales
});

export default translations;
