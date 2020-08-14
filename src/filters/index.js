import filters from "./filters.js";

export default function(Vue) {
  Object.keys(filters).forEach(key => Vue.filter(key, filters[key]));
}
