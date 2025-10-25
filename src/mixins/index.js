import Logger from "@/mixins/logger.mixin.js";
import Mobile from "@/mixins/mobile.mixin.js";
import SideNav from "@/mixins/sidenav.mixin.js";
import Actions from "@/mixins/actions.mixin.js";
import CurrentUser from '@/mixins/currentuser.mixin.js';

export default function(app) {
  app.mixin(Logger);
  app.mixin(Mobile);
  app.mixin(SideNav);
  app.mixin(Actions);
  app.mixin(CurrentUser);
}

export {
  SideNav,
}
