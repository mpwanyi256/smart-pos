export default {
  path: '/',
  name: 'login',
  meta: {
    authrequired: false,
  },
  component: () => import('@/views/auth/login.vue'),
};
