import AwesomeTest from '@/components/AwesomeTest.vue';

const routes = [
  {
    path: '/awesome-test',
    component: AwesomeTest
  },
  {
    path: '',
    redirect: '/awesome-test',
  }
];

export default routes;
