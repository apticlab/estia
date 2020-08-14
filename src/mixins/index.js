import Logger from "@/mixins/logger.mixin.js";
import Mobile from "@/mixins/mobile.mixin.js";
import SideNav from "@/mixins/sidenav.mixin.js";

export default function(Vue) {
  Vue.mixin(Logger);
  Vue.mixin(Mobile);
  Vue.mixin(SideNav);
}
