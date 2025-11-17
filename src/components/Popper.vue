<template>
  <component :is="tagName" ref="wrapperRef">
    <transition :name="transition" @after-leave="doDestroy">
      <span
        v-show="!disabled && showPopper"
        ref="popperRef"
        :class="['popper', rootClass]"
      >
        <slot>{{ content }}</slot>
      </span>
    </transition>
    <span ref="referenceWrapper" style="display: contents">
      <slot name="reference" />
    </span>
  </component>
</template>

<script setup>
import {
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { createPopper } from "@popperjs/core";

const props = defineProps({
  toggler: {
    type: Boolean,
    default: false,
  },
  tagName: {
    type: String,
    default: "span",
  },
  trigger: {
    type: String,
    default: "hover",
    validator: (value) =>
      [
        "clickToOpen",
        "click",
        "clickToToggle",
        "hover",
        "toggler",
        "focus",
      ].includes(value),
  },
  delayOnMouseOver: {
    type: Number,
    default: 10,
  },
  delayOnMouseOut: {
    type: Number,
    default: 10,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  content: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  boundariesSelector: String,
  reference: {
    type: Object,
    default: null,
  },
  forceShow: {
    type: Boolean,
    default: false,
  },
  dataValue: {
    default: null,
  },
  appendToBody: {
    type: Boolean,
    default: false,
  },
  visibleArrow: {
    type: Boolean,
    default: true,
  },
  transition: {
    type: String,
    default: "",
  },
  stopPropagation: {
    type: Boolean,
    default: false,
  },
  preventDefault: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  rootClass: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["show", "hide", "created", "documentClick"]);

const instance = getCurrentInstance();
const componentProxy = instance?.proxy;

const wrapperRef = ref(null);
const referenceWrapper = ref(null);
const popperRef = ref(null);
const referenceElm = ref(null);
const popperJS = ref(null);
const showPopper = ref(false);
const appendedArrow = ref(false);
const appendedToBody = ref(false);
const appendedNode = ref(null);
let hoverTimer = null;

const popperOptions = ref({
  placement: "bottom",
  computeStyle: {
    gpuAcceleration: false,
  },
  ...props.options,
});

watch(
  () => props.options,
  (opts) => {
    popperOptions.value = {
      ...popperOptions.value,
      ...opts,
    };
    if (popperJS.value) {
      popperJS.value.setOptions(popperOptions.value);
    }
  },
  { deep: true }
);

watch(showPopper, (value) => {
  if (value) {
    emit("show", componentProxy);
    updatePopper();
  } else {
    emit("hide", componentProxy);
  }
});

watch(
  () => props.forceShow,
  (value) => {
    value ? doShow() : doClose();
  },
  { immediate: true }
);

watch(
  () => props.toggler,
  (value) => {
    if (showPopper.value !== value) {
      showPopper.value = value;
    }
  }
);

watch(
  () => props.disabled,
  (value) => {
    if (value) {
      showPopper.value = false;
    }
  }
);

watch(
  () => props.reference,
  () => {
    referenceElm.value = resolveReferenceElement();
  }
);

onMounted(() => {
  referenceElm.value = resolveReferenceElement();
  addTriggerListeners();
});

onBeforeUnmount(() => {
  destroyPopper();
  clearTimeout(hoverTimer);
});

function addEvent(element, event, handler) {
  if (element && event && handler) {
    element.addEventListener(event, handler, false);
  }
}

function removeEvent(element, event, handler) {
  if (element && event && handler) {
    element.removeEventListener(event, handler, false);
  }
}

function resolveReferenceElement() {
  if (props.reference) {
    return props.reference;
  }

  if (referenceWrapper.value?.firstElementChild) {
    return referenceWrapper.value.firstElementChild;
  }

  return referenceWrapper.value || wrapperRef.value || null;
}

function addTriggerListeners() {
  const reference = referenceElm.value;
  const popperEl = popperRef.value;
  if (!reference) {
    return;
  }

  switch (props.trigger) {
    case "clickToOpen":
      addEvent(reference, "click", doShow);
      addEvent(document, "click", handleDocumentClick);
      break;
    case "click":
    case "clickToToggle":
      addEvent(reference, "click", doToggle);
      addEvent(document, "click", handleDocumentClick);
      break;
    case "hover":
      addEvent(reference, "mouseover", onMouseOver);
      addEvent(reference, "mouseout", onMouseOut);
      addEvent(popperEl, "mouseover", onMouseOver);
      addEvent(popperEl, "mouseout", onMouseOut);
      break;
    case "focus":
      addEvent(reference, "focus", onMouseOver);
      addEvent(reference, "blur", onMouseOut);
      addEvent(popperEl, "focus", onMouseOver);
      addEvent(popperEl, "blur", onMouseOut);
      break;
    case "toggler":
      addEvent(document, "click", handleDocumentClick);
      break;
  }
}

function doToggle(event) {
  if (props.stopPropagation && event) {
    event.stopPropagation();
  }

  if (props.preventDefault && event) {
    event.preventDefault();
  }

  if (!props.forceShow) {
    showPopper.value = !showPopper.value;
  }
}

function doShow() {
  showPopper.value = true;
}

function doClose() {
  showPopper.value = false;
}

function doDestroy() {
  if (showPopper.value) {
    return;
  }

  if (popperJS.value) {
    popperJS.value.destroy();
    popperJS.value = null;
  }

  if (appendedToBody.value && appendedNode.value) {
    appendedToBody.value = false;
    if (appendedNode.value.parentNode === document.body) {
      document.body.removeChild(appendedNode.value);
    }
    appendedNode.value = null;
  }
}

function createPopperInstance() {
  nextTick(() => {
    const popperEl = popperRef.value;
    const reference = referenceElm.value;
    if (!popperEl || !reference) {
      return;
    }

    if (props.visibleArrow) {
      appendArrow(popperEl);
    }

    if (props.appendToBody && !appendedToBody.value) {
      appendedNode.value = popperEl.parentElement || popperEl;
      appendedToBody.value = true;
      document.body.appendChild(appendedNode.value);
    }

    if (popperJS.value) {
      popperJS.value.destroy();
      popperJS.value = null;
    }

    if (props.boundariesSelector) {
      const boundariesElement = document.querySelector(
        props.boundariesSelector
      );
      if (boundariesElement) {
        popperOptions.value.modifiers = {
          ...(popperOptions.value.modifiers || {}),
          preventOverflow: {
            ...((popperOptions.value.modifiers || {}).preventOverflow || {}),
            boundariesElement,
          },
        };
      }
    }

    popperOptions.value.onCreate = () => {
      emit("created", componentProxy);
      nextTick(() => updatePopper());
    };

    popperJS.value = createPopper(reference, popperEl, popperOptions.value);
  });
}

function destroyPopper() {
  const reference = referenceElm.value;
  const popperEl = popperRef.value;

  removeEvent(reference, "click", doToggle);
  removeEvent(reference, "click", doShow);
  removeEvent(reference, "mouseup", doClose);
  removeEvent(reference, "mousedown", doShow);
  removeEvent(reference, "focus", onMouseOver);
  removeEvent(reference, "blur", onMouseOut);
  removeEvent(reference, "mouseout", onMouseOut);
  removeEvent(reference, "mouseover", onMouseOver);

  removeEvent(popperEl, "mouseover", onMouseOver);
  removeEvent(popperEl, "mouseout", onMouseOut);
  removeEvent(popperEl, "focus", onMouseOver);
  removeEvent(popperEl, "blur", onMouseOut);

  removeEvent(document, "click", handleDocumentClick);

  showPopper.value = false;
  doDestroy();
}

function appendArrow(element) {
  if (appendedArrow.value || !element) {
    return;
  }

  appendedArrow.value = true;

  const arrow = document.createElement("div");
  arrow.setAttribute("data-popper-arrow", "");
  arrow.className = "popper__arrow";
  element.appendChild(arrow);
}

function updatePopper() {
  if (popperJS.value) {
    popperJS.value.update();
  } else {
    createPopperInstance();
  }
}

function onMouseOver() {
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    showPopper.value = true;
  }, props.delayOnMouseOver);
}

function onMouseOut() {
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    showPopper.value = false;
  }, props.delayOnMouseOut);
}

function handleDocumentClick(event) {
  const root = wrapperRef.value;
  const reference = referenceElm.value;
  const popperEl = popperRef.value;

  if (
    !root ||
    !reference ||
    elementContains(reference, event.target) ||
    (popperEl && elementContains(popperEl, event.target)) ||
    elementContains(root, event.target)
  ) {
    return;
  }

  emit("documentClick", componentProxy);

  if (props.forceShow) {
    return;
  }

  showPopper.value = false;
}

function elementContains(elm, otherElm) {
  return typeof elm?.contains === "function" ? elm.contains(otherElm) : false;
}

defineExpose({
  doToggle,
  doShow,
  doClose,
  updatePopper,
});
</script>


<style>
.popper {
  width: auto;
  display: inline-block;
  position: absolute;
  z-index: 200000;
}

.popper .popper__arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
}

.popper[x-placement^="top"] {
  margin-bottom: 5px;
}

.popper[x-placement^="top"] .popper__arrow {
  border-width: 5px 5px 0 5px;
  border-color: #fafafa transparent transparent transparent;
  bottom: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.popper[x-placement^="bottom"] {
  margin-top: 5px;
}

.popper[x-placement^="bottom"] .popper__arrow {
  border-width: 0 5px 5px 5px;
  border-color: transparent transparent #fafafa transparent;
  top: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.popper[x-placement^="right"] {
  margin-left: 5px;
}

.popper[x-placement^="right"] .popper__arrow {
  border-width: 5px 5px 5px 0;
  border-color: transparent #fafafa transparent transparent;
  left: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.popper[x-placement^="left"] {
  margin-right: 5px;
}

.popper[x-placement^="left"] .popper__arrow {
  border-width: 5px 0 5px 5px;
  border-color: transparent transparent transparent #fafafa;
  right: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}
</style>
