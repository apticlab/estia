import { users } from "@/resources/users.resource";

export default function(Vue, resources, options = null) {
  Object.keys(resources).forEach(resource => {
    Vue.prototype.resources[resource] = resources[resource];
  });
}
