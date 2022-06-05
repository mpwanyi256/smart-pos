/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
// import * as firebase from 'firebase'
import firebase from 'firebase/app';
import API from '@/api';
import router from '../../router';

const PATH = 'auth/';

export default {
  namespaced: true,
  state: {
    user: {},
    loading: false,
    error: { status: false, message: '' },
    reviewLink: 'https://g.page/prodev-group-kampala/review?nr',
    routes: [
      {
        icon: 'mdi-cart', name: 'Pos', path: 'pos', allowedUsers: [1, 2, 3, 5, 6], packages: [1, 2, 3],
      },
      {
        icon: 'mdi-sale', name: 'Sales', path: 'overview', allowedUsers: [1, 5, 6], packages: [1, 2, 3],
      },
      // {
      //   icon: 'mdi-webhook', name: 'Cashbook Accounting', path: 'accountingDashboard',
      // allowedUsers: [1, 5, 6], packages: [1, 2, 3],
      // },
      {
        icon: 'mdi-shopping', name: 'Inventory', path: 'inv_dashboard', allowedUsers: [1, 5, 6, 8], packages: [2, 3],
      },
      // { icon: 'mdi-graph', name: 'Reports', path: 'reports' },
      {
        icon: 'mdi-bed', name: 'Accomodation', path: 'accomodation_statistics', allowedUsers: [1, 5, 6, 9], packages: [3],
      },
      {
        icon: 'mdi-bed', name: 'RealEstates', path: 'tenants', allowedUsers: [1, 2, 3, 4, 5, 6, 7, 8], packages: [4],
      },
      {
        icon: 'mdi-monitor', name: 'kds', path: 'kds', allowedUsers: [1, 2, 3, 4, 5, 6, 7, 8], packages: [1, 2, 3],
      },
      {
        icon: 'mdi-cog', name: 'Settings', path: 'access_controls', allowedUsers: [5], packages: [1, 2, 3],
      },
    ],
    license: null,
    company: null,
    packages: [],
  },
  mutations: {
    setLoading(state, payload) {
      state.loading = payload;
    },
    setPackages(state, data) {
      state.packages = data;
    },
    setCompany(state, info) {
      state.company = info;
    },
    setLicense(state, payload) {
      state.license = payload;
    },
    setCompanyDay(state, dayOpen) {
      state.user.company_info.day_open = dayOpen.day;
      localStorage.setItem('smart_company_day_open', dayOpen.day);
      state.user.company_info.day_open_display = dayOpen.display;
    },
    setRoles(state, payload) {
      state.roles = payload;
    },
    setUsers(state, payload) {
      state.users = payload;
    },
    resetUser(state) {
      state.user = null;
    },
    toggleLoading(state, payload) {
      state.loading = payload;
    },
    seterror(state, payload) {
      state.error = { status: true, message: payload };
    },
    clearError(state) {
      state.error = { status: false, message: '' };
    },
    setUser(state, payload) {
      state.user = payload;
    },
  },
  actions: {
    post({ commit }, payload) {
      const frm = new FormData();
      const params = Object.keys(payload);

      params.forEach((par) => {
        frm.append(par, payload[par]);
      });
      return API.smart(PATH, frm);
    },
    async addCompanyFirebase({ commit }, companyInfo) {
      const Companies = firebase.firestore().collection('Companies');
      const compExists = await Companies.where('Email', '==', companyInfo.Email).get().catch(() => null);
      if (compExists && !compExists.empty) {
        return { error: true, message: 'Sorry, there is a company with the same email in your firebase client list' };
      }
      const newCompany = await Companies.add(companyInfo)
        .then((doc) => ({ error: false, id: doc.id }))
        .catch((e) => ({ error: true, id: e.message }));
      return newCompany;
    },
    async getPackages({ commit }) {
      const Packages = firebase.firestore().collection('Packages');
      const Pkgs = await Packages.orderBy('name', 'asc').get().catch(() => []);
      const posPackages = [];

      if (!Pkgs.empty) {
        Pkgs.forEach((doc) => {
          posPackages.push({ ...doc.data(), id: doc.id });
        });
      }
      commit('setPackages', posPackages);
    },
    async getFirebaseInfo({ commit }) {
      const email = localStorage.getItem('smart_company_email');
      const Companies = firebase.firestore().collection('Companies');
      const companyInfo = await Companies
        .where('Email', '==', email)
        .get();

      if (!companyInfo.empty) {
        companyInfo.forEach((doc) => {
          commit('setCompany', { ...doc.data(), id: doc.id });
        });
      }
    },
    async updateFbLicense({ commit }, license) {
      commit('setLoading', true);
      const DB = firebase.firestore().collection('licenses');
      await DB
        .doc(license.id).update({ status: 1, end_date: license.end_date })
        .then(() => {
          commit('setLicense', null);
          router.replace({ name: 'pos' });
        })
        .catch(() => {
          console.error('Error updating doc');
        });
      commit('setLoading', false);
    },
    async getActiveLicense({ commit }, companyEmail) {
      commit('setLoading', true);
      const LICENSES = firebase.firestore().collection('licenses');
      const activeLicense = await LICENSES
        .where('company', '==', companyEmail)
        .where('status', '==', 0)
        .limit(1)
        .get()
        .catch((e) => {
          console.log('Firebase error', e.message);
        });

      const setMutation = (data) => {
        commit('setLicense', data);
      };

      if (!activeLicense.empty) {
        activeLicense.forEach((doc) => {
          setMutation({ ...doc.data(), id: doc.id });
        });
      }
      commit('setLoading', false);
    },
    setLoading({ commit }, payload) {
      commit('toggleLoading', payload);
    },
    setError({ commit }, payload) {
      commit('seterror', payload);
    },
    clearError({ commit }) {
      commit('clearError');
    },
    async performLogin({ dispatch, commit }, payload) {
      commit('toggleLoading', true);
      const params = new FormData();
      params.append('username', payload.username);
      params.append('password', payload.password);

      // const authData = await
      const authData = await API.smart(PATH, params).catch((e) => null);
      commit('toggleLoading', false);
      if (!authData || authData.error) {
        const message = authData ? authData.error : 'Sorry, there was an error. Please check server Connection';
        dispatch('setError', message);

        // For one time users
        if (authData && authData.verification_error) {
          router.push({
            name: 'verification',
            params: {
              company_email: payload.username,
            },
          });
        }
      } else {
        const userInfo = authData.data;
        dispatch('auth/verifyAuth', { userInfo, payload }, { root: true });
      }
    },
    async verifyAuth({ dispatch, commit }, { userInfo, payload }) {
      // Set local defaults
      localStorage.setItem('smart_user_id', userInfo.id);
      localStorage.setItem('smart_user_name', userInfo.user_name);
      localStorage.setItem('smart_user_role', userInfo.role);
      localStorage.setItem('smart_company_id', userInfo.company_info.company_id);
      localStorage.setItem('smart_company_day_open', userInfo.company_info.day_open);
      localStorage.setItem('smart_company_email', userInfo.company_info.company_email);
      localStorage.setItem('smart_outlet_id', userInfo.outlet_id);
      commit('setUser', userInfo);

      const DAYSLEFT = userInfo.company_info.days_left;
      const PACKAGE = userInfo.package;

      if (DAYSLEFT <= 0) {
        commit('toggleLoading', false);
        dispatch('setError', 'Sorry, your license expired');
        dispatch('performLogout');
        return;
      }

      await dispatch('settings/fetchOutletSettings',
        { get_access_controls: 'all', outlet: userInfo.outlet_id }, { root: true });

      const CurrentPath = router.currentRoute.name;
      if (CurrentPath === 'login') {
        if (payload && payload.new_account === 'new account') {
          router.push({ name: 'company_settings' });
        } else if ([1, 2, 3].includes(PACKAGE)) {
          if (userInfo.role === 4) {
            router.push({ name: 'kds' });
          } else {
            router.push({ name: 'pos' });
          }
          dispatch('settings/fetch', { get_access_controls: 'all' }, { root: true });
        } else if (PACKAGE === 4) {
          router.push({ name: 'tenants' });
        } else {
          dispatch('setError', 'Sorry, you have no access to this section');
          dispatch('performLogout');
        }
      }
    },
    async getUserById({ dispatch, commit }, payload = null) {
      const loggedinUser = payload ? payload.user_id : localStorage.getItem('smart_user_id');
      if (!loggedinUser) {
        console.log('no login information found');
        dispatch('setError', 'no login information found');
        return router.push({ name: 'login' });
      }

      commit('toggleLoading', true);
      const params = new FormData();
      params.append('auth_by_id', loggedinUser);
      const authData = await API.smart(PATH, params).catch((e) => null);
      commit('toggleLoading', false);
      if (authData && authData.error) {
        dispatch('setError', authData.message);
        if (authData.verification_error) {
          router.push({ name: 'verification' });
        } else {
          router.push({ name: 'login' });
        }
      } else {
        const userInfo = authData.data;
        dispatch('auth/verifyAuth', { userInfo, payload }, { root: true });
      }
    },
    performLogout({ commit }) {
      localStorage.removeItem('smart_user_id');
      localStorage.removeItem('smart_user_name');
      localStorage.removeItem('smart_user_role');
      localStorage.removeItem('smart_company_day_open');
      localStorage.removeItem('smart_company_id');
      commit('setUser', null);
      router.push({ name: 'login' });
    },
    async getDayOpen({ commit }, companyId) {
      const params = new FormData();
      params.append('day_open', companyId);
      const companyDay = await API.smart(PATH, params);
      commit('setCompanyDay', { day: companyDay.data, display: companyDay.day_display });
    },
    async performLicenseExtension({ commit }, payload) {
      commit('toggleLoading', true);
      const frm = new FormData();
      frm.append('extend_license', payload.extend_license);
      frm.append('duration', payload.duration);
      frm.append('company_id', payload.company_id);
      commit('toggleLoading', false);
      return API.smart(PATH, frm);
    },
  },
  getters: {
    error: (state) => state.error,
    loading: (state) => state.loading,
    user: (state) => state.user,
    routes: (state) => state.routes,
    license: (state) => state.license,
    reviewLink: (state) => state.reviewLink,
    fbCompany: (state) => state.company,
    packages: (state) => state.packages,
  },
};
