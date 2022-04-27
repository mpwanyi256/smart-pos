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
      const companyId = localStorage.getItem('smart_company_id');
      commit('loading', true);
      const params = new FormData();
      const updateKeys = Object.keys(payload);
      updateKeys.forEach((key) => {
        params.append(key, payload[`${key}`]);
      });
      if (!payload.company_id) params.append('company_id', companyId);
      commit('loading', false);
      return API.smart(PATH, params);
    },
  },
};
