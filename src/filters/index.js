import filters from "./filters.js";

export default function(app, userFilters) {
  // In Vue 3, filters are removed. We'll expose them as global properties instead.
  // Users will need to call them as methods: {{ $filters.filterName(value) }}
  const allFilters = { ...filters, ...userFilters };
  app.config.globalProperties.$filters = allFilters;
}
