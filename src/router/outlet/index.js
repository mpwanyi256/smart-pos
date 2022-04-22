export default {
  path: '/pick-outlet',
  name: 'pick-outlet',
  props: true,
  meta: {
    authrequired: true,
    title: 'Pick outlet',
  },
  component: () => import('@/views/auth/SelectOutlet.vue'),
};
