export default {
  path: '/Settings',
  name: 'settings',
  meta: {
    authrequired: true,
    title: 'SmartPOS :: Settings',
  },
  component: () => import('@/views/Settings/Home.vue'),
  children: [
    {
      path: 'AccessControls',
      name: 'access_controls',
      meta: {
        authrequired: true,
        title: 'SmartPOS :: Access controls',
      },
      component: () => import('@/views/Settings/AccessControls.vue'),
    },
    {
      path: 'CompanySettings',
      name: 'company_settings',
      meta: {
        authrequired: true,
        title: 'SmartPOS :: Company settings',
      },
      component: () => import('@/views/Settings/CompanySettings.vue'),
    },
    {
      path: 'CompanyDepartments',
      name: 'company_departments',
      meta: {
        authrequired: true,
        title: 'SmartPOS :: Company departments',
      },
      component: () => import('@/views/Settings/Departments.vue'),
    },
    {
      path: 'Employees',
      name: 'company_employees',
      meta: {
        authrequired: true,
        title: 'SmartPOS :: Employees',
      },
      component: () => import('@/views/Settings/Employees.vue'),
    },
    {
      path: 'Sections',
      name: 'sections_and_tables',
      meta: {
        authrequired: true,
        title: 'SmartPOS :: Sections & Tables',
      },
      component: () => import('@/views/Settings/SectionsAndTables.vue'),
    },
    {
      path: 'Emailing',
      name: 'company_mail_list',
      meta: {
        authrequired: true,
        title: 'SmartPOS :: Mail List',
      },
      component: () => import('@/views/Settings/EmailList.vue'),
    },
    {
      path: 'Clients',
      name: 'company_clients',
      meta: {
        authrequired: true,
        title: 'SmartPOS :: Clients',
      },
      component: () => import('@/views/Settings/Clients.vue'),
    },
    {
      path: 'Outlets',
      name: 'company_outlets',
      meta: {
        authrequired: true,
        title: 'SmartPOS :: Outlets',
      },
      component: () => import('@/views/Settings/Outlets.vue'),
    },
    {
      path: 'Departments',
      name: 'company_departments_list',
      meta: {
        authrequired: true,
        title: 'SmartPOS :: Departments',
      },
      component: () => import('@/views/Settings/CompanyDepartments.vue'),
    },
    {
      path: 'settings_menu_items',
      name: 'settings_menu_categories',
      meta: {
        authrequired: true,
        title: 'SmartPOS :: Menu Categories',
      },
      component: () => import('@/views/dashboard/sales/MenuCategories.vue'),
    },
    {
      path: 'settings_menu_items',
      name: 'settings_menu_items',
      meta: {
        authrequired: true,
        title: 'SmartPOS :: Menu Items',
      },
      component: () => import('@/views/dashboard/sales/MenuItems.vue'),
    },
  ],
};
