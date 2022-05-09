import API from '@/api';

const PATH = 'menu/';

export default {
  namespaced: true,
  state: {
    loading: false,
    menuItems: [],
    departments: [],
    menuCategories: [],
  },
  mutations: {
    setCategories(state, payload) {
      state.menuCategories = payload;
    },
    setDepartments(state, payload) {
      state.departments = payload;
    },
    setMenuItems(state, payload) {
      state.menuItems = payload;
    },
    toggleLoading(state, payload) {
      state.loading = payload;
    },
  },
  actions: {
    toggleLoad({ commit }, payload) {
      commit('toggleLoading', payload);
    },

    post({ commit }, payload) {
      commit('toggleLoading', true);
      const data = new FormData();
      const params = Object.keys(payload);
      params.forEach((key) => {
        data.append(key, payload[`${key}`]);
      });
      return API.smart(PATH, data);
    },

    async getMenuItems({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('get_menu_items', payload.department_id);
      filters.append('company_id', localStorage.getItem('smart_company_id'));
      const menuItems = await API.smart(PATH, filters);
      if (!menuItems.error) commit('setMenuItems', menuItems.data);
      if (payload.department_id !== 'download') commit('toggleLoading', false);
      commit('toggleLoading', false);
      return menuItems;
    },

    async getDepartments({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('get_departments', payload);
      filters.append('company_id', localStorage.getItem('smart_company_id'));
      const departments = await API.smart(PATH, filters);
      if (!departments.error) {
        commit('setDepartments', [{ id: 0, name: 'ALL' }, ...departments.data]);
      }
      commit('toggleLoading', false);
    },

    async updateItemStatus({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('update_item_status', true);
      filters.append('item_id', payload.id);
      filters.append('item_status', payload.status);
      const update = await API.smart(PATH, filters);
      commit('toggleLoading', false);
      return update;
    },

    async getMenuCategories({ commit }) {
      const filters = new FormData();
      filters.append('get_menu_categories', true);
      filters.append('company_id', localStorage.getItem('smart_company_id'));
      const categories = await API.smart(PATH, filters);
      if (!categories.error) commit('setCategories', categories.data);
    },

    async updateMenuItemCategory({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('update_menu_category', true);
      filters.append('category_id', payload.id);
      filters.append('category_status', payload.status);
      return API.smart(PATH, filters);
    },

    async updateMenuItemCategoryName({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('update_menu_category_name', true);
      filters.append('category_id', payload.id);
      filters.append('category_name', payload.name);
      return API.smart(PATH, filters);
    },

    async updateItem({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('update_item', true);
      filters.append('item_id', payload.item_id);
      filters.append('item_name', payload.name);
      filters.append('price', payload.price);
      filters.append('category_id', payload.category_id);
      filters.append('display', payload.display);
      const itemUpdate = await API.smart(PATH, filters);
      commit('toggleLoading', false);
      return itemUpdate;
    },

    async createNewItem({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('create_new_item', true);
      filters.append('item_name', payload.name);
      filters.append('category_id', payload.category_id);
      filters.append('display', payload.display);
      filters.append('item_price', payload.price);
      filters.append('company_id', payload.company_id);

      const create = API.smart(PATH, filters);
      commit('toggleLoading', false);
      return create;
    },

    async CreateMenuCategory({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('new_category_name', payload.name);
      filters.append('company_id', payload.company_id);

      const create = API.smart(PATH, filters);
      commit('toggleLoading', false);
      return create;
    },

  },
  getters: {
    loading: (state) => state.loading,
    menuItems: (state) => state.menuItems,
    departments: (state) => state.departments,
    categories: (state) => state.menuCategories,
  },
};
