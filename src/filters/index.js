import filters from "./filters.js";

export default function(Vue, userFilters) {
  Object.keys(filters).forEach(key => Vue.filter(key, filters[key]));
  Object.keys(userFilters).forEach(key => Vue.filter(key, userFilters[key]));
}
