import { createI18n } from "vue-i18n";
import locales from "./locales";

const i18n = createI18n({
  locale: "it",
  fallbackLocale: "en",
  messages: locales
});

export default i18n;
