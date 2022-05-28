export default {
  path: '/manage',
  name: 'manage',
  meta: {
    authrequired: true,
    title: 'Clients management',
    admin_access: false,
  },
  component: () => import('@/views/Manage/home.vue'),
  children: [
    {
      path: 'manage_clients',
      name: 'manage_clients',
      meta: {
        authrequired: true,
        title: 'Manage | Clients',
      },
      component: () => import('@/views/Manage/POSClients.vue'),
    },
  ],
};
