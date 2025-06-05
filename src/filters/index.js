import filters from "./filters.js";

export default function(app, userFilters) {
  const all = { ...filters, ...userFilters };
  app.config.globalProperties.$filters = {
    ...(app.config.globalProperties.$filters || {}),
    ...all,
  };
}
