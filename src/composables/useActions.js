import { computed, getCurrentInstance } from "vue";
import { itemIsVisible as defaultItemIsVisible } from "../utils/helpers";

export function useActions({
  actions,
  currentItem = null,
  scope = "list",
  getUserRole,
  itemIsVisible = defaultItemIsVisible,
  proxy = getCurrentInstance()?.proxy,
}) {
  const resolveUserRole = () =>
    (typeof getUserRole === "function"
      ? getUserRole()
      : proxy?.getUserRole?.()) || "";

  const normalizedActions = computed(() =>
    actions?.value !== undefined ? actions.value : actions || []
  );

  const visibleActions = computed(() =>
    normalizedActions.value.filter((action) => {
      if (action.multi) return false;
      const roleFilter =
        !action.roles || action.roles.includes(resolveUserRole());
      const scopeValue = scope?.value ?? scope;
      const scopeFilter =
        !action.scopes || action.scopes.includes(scopeValue || "list");
      const visibilityFilter = action.visible
        ? itemIsVisible(
            action,
            currentItem?.value ?? currentItem,
            proxy ?? currentItem
          )
        : true;
      return roleFilter && scopeFilter && visibilityFilter;
    })
  );

  const multiActions = computed(() =>
    normalizedActions.value.filter(
      (action) =>
        action.multi &&
        (!action.roles || action.roles.includes(resolveUserRole()))
    )
  );

  const scopedActions = computed(() =>
    normalizedActions.value.filter((action) => {
      if (action.multi) return false;
      const roleFilter =
        !action.roles || action.roles.includes(resolveUserRole());
      const scopeValue = scope?.value ?? scope;
      const scopeFilter =
        !action.scopes || action.scopes.includes(scopeValue || "list");
      return roleFilter && scopeFilter;
    })
  );

  const act = (action, payload = null) => {
    if (!action) return;
    const target = payload ?? currentItem?.value ?? currentItem;
    const callbackName = action.callback || action.code;
    const localHandler = proxy?.[callbackName];
    if (typeof localHandler === "function") {
      localHandler(target);
      return;
    }
    const globalHandler = proxy?.$actions?.[callbackName];
    if (typeof globalHandler === "function") {
      globalHandler(proxy, target);
    }
  };

  const actOnRow = ({ action, index }) => {
    if (!action) return;
    const rows = proxy?.rows || [];
    const row = rows[index];
    act(action, row);
  };

  return {
    visibleActions,
    scopedActions,
    multiActions,
    act,
    actOnRow,
  };
}
