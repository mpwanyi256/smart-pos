export default {
  path: '/home',
  name: 'home',
  meta: {
    authrequired: true,
    title: 'Home',
  },
  component: () => import('@/views/dashboard/home.vue'),
  children: [
    {
      path: 'sales',
      name: 'sales',
      meta: {
        authrequired: true,
        title: 'Sales | Home',
      },
      component: () => import('@/views/dashboard/sales/sales.vue'),
      children: [
        {
          path: 'overview',
          name: 'overview',
          meta: {
            authrequired: true,
            title: 'Sales | Dashboard',
          },
          component: () => import('@/components/sales/SalesDashboard.vue'),
          // component: () => import('@/views/dashboard/sales/reports/salesOverview.vue'),
        },
        {
          path: 'findbill',
          name: 'findbill',
          meta: {
            authrequired: true,
            title: 'Sales | Find a bill',
          },
          component: () => import('@/views/dashboard/sales/reports/findBill.vue'),
        },
        {
          path: 'itemwisesale',
          name: 'itemwisesale',
          meta: {
            authrequired: true,
            title: 'Sales | Items sold',
          },
          component: () => import('@/views/dashboard/sales/reports/ItemsSold.vue'),
        },
        {
          path: 'salesSammary',
          name: 'salessammary',
          meta: {
            authrequired: true,
            title: 'Sales | Sales summary',
          },
          component: () => import('@/views/dashboard/sales/reports/SalesSammary.vue'),
        },
        {
          path: 'menu_items',
          name: 'menu_items',
          meta: {
            authrequired: true,
            title: 'Sales | Menu Items',
          },
          component: () => import('@/views/dashboard/sales/MenuItems.vue'),
        },
        {
          path: 'menu_categories',
          name: 'menu_categories',
          meta: {
            authrequired: true,
            title: 'Sales | Menu Item categories',
          },
          component: () => import('@/views/dashboard/sales/MenuCategories.vue'),
        },
        {
          path: 'discounts_report',
          name: 'discounts_report',
          meta: {
            authrequired: true,
            title: 'Sales | Discounted bills',
          },
          component: () => import('@/components/sales/DiscountsReport.vue'),
        },
        {
          path: 'cancellations',
          name: 'cancellations_report',
          meta: {
            authrequired: true,
            title: 'Sales | Item Cancellations',
          },
          component: () => import('@/components/sales/ItemCancellations.vue'),
        },
        {
          path: 'nc_report',
          name: 'nc_report',
          meta: {
            authrequired: true,
            title: 'Sales | NC Reports',
          },
          component: () => import('@/components/sales/NCReports.vue'),
        },
      ],
    },
  ],
};
