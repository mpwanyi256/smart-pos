import axios from 'axios';
import Vue from 'vue';
import firebase from 'firebase/app';
import fbConf from '@/fbConfig';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import './styles/main.scss';
import eventBus from './plugins/event-bus';
import EventBusCallbacks from './plugins/Eventbus';
import idb from './mixins/idb';

import 'firebase/firebase-analytics';
import 'firebase/firestore';

// Api server address set
const IPAddress = localStorage.getItem('smartpos_ipaddress_set');
axios.defaults.baseURL = IPAddress || 'http://localhost:80/papi/';
// IPAddress ? `http://${IPAddress}/papi/` : 'http://localhost:80/papi/';
// axios.defaults.baseURL = 'http://localhost:80/papi/';
Vue.config.productionTip = false;

// eslint-disable-next-line consistent-return
router.beforeEach((to, from, next) => {
  const loggedUser = localStorage.getItem('smart_user_id');
  if (to.meta.authrequired && !loggedUser) {
    return next({ replace: true, name: 'login' });
  } if (to.meta.authrequired && loggedUser) {
    return next();
  } if (!to.meta.authrequired) {
    return next();
  } if (to.path === from.path) {
    return null;
  }
  next();
});

Vue.use(EventBusCallbacks, eventBus);

Vue.prototype.$eventBus = eventBus;

new Vue({
  router,
  store,
  vuetify,
  async created() {
    // initialize firebase
    firebase.initializeApp(fbConf);
    firebase.firestore().settings({
      cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    });

    firebase.analytics();
    firebase.firestore().enablePersistence();

    await idb.init().catch((e) => { console.error(e); });
    const LoggedInUser = localStorage.getItem('smart_user_id');
    if (LoggedInUser) {
      store.dispatch('auth/getUserById');
      // store.dispatch('settings/fetch', { get_access_controls: 'all' });
      // firebase.firestore().collection('licenses')
      //   .onSnapshot(async () => {
      //     const compEmail = localStorage.getItem('smart_company_email');
      //     if (compEmail) await store.dispatch('auth/getActiveLicense', compEmail);
      //     if (compEmail === 'prodevgroup256@gmail.com')
      // await store.dispatch('manage/fetchClientLicenses');
      //   });
    } else store.replace({ name: 'login' });
  },
  render: (h) => h(App),
}).$mount('#app');
