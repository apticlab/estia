import { getCurrentInstance, inject } from "vue";

export const ThemeSymbol = Symbol("theme");

export function useTheme() {
  const theme = inject(ThemeSymbol, null);
  if (theme) {
    return theme;
  }

  const instance = getCurrentInstance();
  const fallback = instance?.appContext.config.globalProperties.$theme;
  if (!fallback) {
    throw new Error("useTheme must be used within a component tree that provides a theme.");
  }

  return fallback;
}
