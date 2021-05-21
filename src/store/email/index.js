import API from '@/api';

const PATH = 'mail/';

export default {
  namespaced: true,
  state: {
    loading: false,
  },
  mutations: {
    loading(state, payload) {
      state.loading = payload;
    },
  },
  actions: {
    sendEmail({ commit }, payload) {
      commit('loading', true);
      const params = new FormData();
      const updateKeys = Object.keys(payload);
      updateKeys.forEach((key) => {
        params.append(key, payload[`${key}`]);
      });
      commit('loading', false);
      return API.smart(PATH, params);
    },
  },
  getters: {},
};