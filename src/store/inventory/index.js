import API from '@/api';

const PATH = 'inventory/';

export default {
  namespaced: true,
  state: {
    storeItems: [],
    measures: [],
    categories: [],
  },
  mutations: {
    setStoreItems(state, payload) {
      state.storeItems = payload;
    },
    setMeasures(state, payload) {
      state.measures = payload;
    },
    setCategories(state, payload) {
      state.categories = payload;
    },
  },
  actions: {
    async getStoreItems({ commit }, payload) {
      const params = new FormData();
      params.append('get_store_items', 'all');
      params.append('company_id', payload.company_id);
      const items = await API.smart(PATH, params);
      if (!items.error) commit('setStoreItems', items.data);
    },

    async getStoreMeasures({ commit }, payload) {
      const params = new FormData();
      params.append('get_measures', payload);
      const items = await API.smart(PATH, params);
      if (!items.error) commit('setMeasures', items.data);
    },

    async getStoreCategories({ commit }, payload) {
      const params = new FormData();
      params.append('get_store_categories', payload.category_id);
      const categories = await API.smart(PATH, params);
      if (!categories.error) commit('setCategories', categories.data);
    },

    async updateItem({ commit }, payload) {
      const params = new FormData();
      const updateKeys = Object.keys(payload);
      updateKeys.forEach((key) => {
        params.append(key, payload.[`${key}`]);
      });
      commit('loading', true);
      return API.smart(PATH, params);
    },
  },
  getters: {
    storeItems: (state) => state.storeItems,
    storeMeasures: (state) => state.measures,
    categories: (state) => state.categories,
  },
};
