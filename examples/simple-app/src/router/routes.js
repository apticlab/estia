import AwesomeTest from '@/components/AwesomeTest.vue';

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
