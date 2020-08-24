import AwesomeTest from '@/components/AwesomeTest.vue';
import ListResource from '@/components/ListResource.vue';

const innerRoutes = [
  {
    path: '/awesome-test',
    component: AwesomeTest,
    name: "awesometest",
    meta: {
      label: "Awesome Test",
    }
  },
  {
    path: '/list-resource-test',
    component: ListResource,
    name: "listresourcetest",
    meta: {
      label: "Resource Test",
      resource: "test"
    }

  },
  {
    path: '',
    redirect: '/awesome-test',
  }
];

const outerRoutes = [
];

const noAuthRouteList = [
  'awesometest'
];

export { innerRoutes, outerRoutes, noAuthRouteList };
