import { inject, getCurrentInstance } from "vue";
import { ApiSymbol } from "../utils/api.js";

export function useApi() {
  const api =
    inject(ApiSymbol) ||
    getCurrentInstance()?.appContext.config.globalProperties.$api;

  if (!api) {
    throw new Error("useApi must be used within an application that installed Estia.");
  }

  return api;
}
