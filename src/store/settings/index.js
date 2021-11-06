import API from '@/api';

const PATH = 'settings/';
export default {
  namespaced: true,
  state: {
    loading: false,
    controls: [],
  },
  mutations: {
    loading(state, payload) {
      state.loading = payload;
    },
    setColtrols(state, payload) {
      state.controls = payload;
    },
  },
  actions: {
    async fetch({ commit }, payload) {
      commit('loading', true);
      // const OUTLET_ID = localStorage.getItem('smart_outlet_id');
      const params = new FormData();
      const updateKeys = Object.keys(payload);
      updateKeys.forEach((key) => {
        params.append(key, payload[`${key}`]);
      });
      commit('loading', false);
      // params.append('outlet_id', payload.outlet || OUTLET_ID);
      const conts = await API.smart(PATH, params);
      if (!conts.error) commit('setColtrols', conts.data);
    },
    post({ commit }, payload) {
      // const OUTLET_ID = localStorage.getItem('smart_outlet_id');
      commit('loading', true);
      const params = new FormData();
      const updateKeys = Object.keys(payload);
      updateKeys.forEach((key) => {
        params.append(key, payload[`${key}`]);
      });
      params.append('company_id', localStorage.getItem('smart_company_id'));
      // params.append('outlet_id', payload.outlet || OUTLET_ID);
      commit('loading', false);
      return API.smart(PATH, params);
    },

    fetchOutletSettings({ commit }, payload) {
      commit('loading', true);
      const params = new FormData();
      const updateKeys = Object.keys(payload);
      updateKeys.forEach((key) => {
        params.append(key, payload[`${key}`]);
      });
      // params.append('outlet_id', payload.outlet);
      commit('loading', false);
      return API.smart(PATH, params);
    },
  },
  getters: {
    controls: (state) => state.controls,
  },
};
