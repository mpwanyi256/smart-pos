export default {
  path: '/password-reset',
  name: 'password-reset',
  meta: {
    authrequired: false,
    title: 'Account Recovery',
  },
  component: () => import('@/views/auth/Resetpassword.vue'),
};
