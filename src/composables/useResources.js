import { inject, getCurrentInstance } from "vue";
import { ResourcesSymbol } from "@/resources/index.js";

export function useResources() {
  const injected =
    inject(ResourcesSymbol) ||
    getCurrentInstance()?.appContext.config.globalProperties.resources;

  if (!injected) {
    throw new Error("useResources must be used within an application that installed Estia.");
  }

  return injected;
}
