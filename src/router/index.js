import Vue from 'vue';
import VueRouter from 'vue-router';
import Meta from 'vue-meta';
import auth from './auth';
import error from './error';
import home from './home';
import setup from './setup';
import inventory from './inventory';
import Accounting from './accounting';
import POS from './pos';
import Accomodation from './accomodation';
import Settings from './settings';
import Manage from './manage';
import KDS from './kds';
import Estates from './estates';
import Outlets from './outlet';
import Verification from './verification';

Vue.use(VueRouter);
Vue.use(Meta, {
  refreshOnceOnNavigation: true,
});

const routes = [
  auth,
  error,
  home,
  Accounting,
  setup,
  inventory,
  POS,
  Accomodation,
  Settings,
  Manage,
  KDS,
  Estates,
  Outlets,
  Verification,
  { path: '*', component: () => import('@/views/auth/login.vue') },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition || from.meta.scrollToTop === false) {
      return savedPosition;
    } if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ selector: to.hash });
        }, 1000);
      });
    } if (to.path !== from.path) {
      return { x: 0, y: 0 };
    }
    return {};
  },
});

router.beforeEach((to, from, next) => {
  const LoggedInUser = localStorage.getItem('smart_user_id');
  if (to.authrequired && !LoggedInUser) {
    router.push({ name: 'login' });
  }
  if (to.matched.length) {
    document.title = to.meta.title;
    next();
  } else {
    document.title = 'Page not found';
    router.push({ name: 'login' });
  }
});

export default router;
