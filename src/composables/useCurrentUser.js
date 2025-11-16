import { computed, getCurrentInstance, inject } from "vue";

export const CurrentUserSymbol = Symbol("estiaCurrentUser");

export function provideCurrentUser(app, store, roleLookup) {
  if (!store) {
    return;
  }

  const user = computed(() => store.state?.user?.user || null);

  const getUserRole = () => {
    const currentUser = user.value;
    if (!currentUser) {
      return "";
    }
    if (typeof roleLookup === "function") {
      return roleLookup(currentUser);
    }
    return currentUser.role?.code?.toLowerCase() || "";
  };

  const api = {
    user,
    getUserRole,
  };

  app.config.globalProperties.getUserRole = getUserRole;
  app.provide(CurrentUserSymbol, api);

  return api;
}

export function useCurrentUser() {
  const injected = inject(CurrentUserSymbol, null);
  if (injected) {
    return injected;
  }

  const instance = getCurrentInstance();
  const store =
    instance?.appContext.config.globalProperties.$store ||
    instance?.proxy?.$store;
  const roleLookup =
    instance?.appContext.config.globalProperties.$roleLookup;

  const user = computed(() => store?.state?.user?.user || null);
  const getUserRole = () => {
    const currentUser = user.value;
    if (!currentUser) {
      return "";
    }
    if (typeof roleLookup === "function") {
      return roleLookup(currentUser);
    }
    return currentUser.role?.code?.toLowerCase() || "";
  };

  return { user, getUserRole };
}
