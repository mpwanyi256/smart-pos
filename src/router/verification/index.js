export default {
  path: '/verification',
  name: 'verification',
  meta: {
    authrequired: false,
    title: 'Verify Account',
  },
  component: () => import('@/views/auth/Verification.vue'),
};
