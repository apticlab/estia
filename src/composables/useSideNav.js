import { ref, getCurrentInstance, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export function useSideNav() {
  const instance = getCurrentInstance();
  const route = useRoute();
  const EventBus = instance?.appContext.config.globalProperties.EventBus;
  const is_mobile = instance?.appContext.config.globalProperties.is_mobile;
  const log = instance?.appContext.config.globalProperties.log;

  const is_collapsed = ref(false);
  const show_text = ref(true);

  const getSideBarCollapseState = () => {
    if (localStorage.getItem('is_collapsed')) {
      is_collapsed.value = !!JSON.parse(localStorage.getItem('is_collapsed'));
    } else {
      if (is_mobile) {
        is_collapsed.value = true;
      }
    }

    if (!is_collapsed.value) return 0;
    show_text.value = false;
  };

  const collapseSideBar = () => {
    const expanding = is_collapsed.value;
    if (expanding) {
      log?.('show-text', is_mobile);

      if (is_mobile) {
        show_text.value = !show_text.value;
        EventBus?.emit('side-bar:show-text', show_text.value);
      } else {
        // in modalità desktop il tempo del timeout deve essere
        // minore di 100ms rispetto alla durata dell'animazione
        setTimeout(() => {
          show_text.value = !show_text.value;
          EventBus?.emit('side-bar:show-text', show_text.value);
        }, 200);
      }
    } else {
      show_text.value = !show_text.value;
      EventBus?.emit('side-bar:show-text', show_text.value);
    }

    is_collapsed.value = !is_collapsed.value;
    localStorage.setItem('is_collapsed', is_collapsed.value);
    EventBus?.emit('side-bar:collapse', is_collapsed.value);
  };

  const listenForSideNavCollapseEvent = () => {
    EventBus?.on('side-bar:collapse', (value) => {
      is_collapsed.value = value;
    });
    EventBus?.on('side-bar:show-text', (value) => {
      show_text.value = value;
    });
  };

  const routeSectionTitle = () => {
    let labels = route.matched
      .map((r) => (r.meta ? r.meta.label : null))
      .reverse();

    // Return the first not null && not undefined label
    return labels.find((label) => !!label);
  };

  onMounted(() => {
    getSideBarCollapseState();
  });

  return {
    is_collapsed,
    show_text,
    getSideBarCollapseState,
    collapseSideBar,
    listenForSideNavCollapseEvent,
    routeSectionTitle
  };
}
