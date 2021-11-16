import API from '@/api';

const PATH = 'pos/';
const SALES = 'scylla/';

export default {
  namespaced: true,
  state: {
    loading: false,
    menuItems: [],
    departments: [],
    menuCategories: [],
    runningOrder: null,
    runningOrderId: null,
    loadedOrders: [],
    paymentSettlements: [],
    selectedTableId: null,
  },
  mutations: {
    setWorkingTable(state, tableId) {
      state.selectedTableId = tableId;
    },
    setpaymentSettlements(state, payload) {
      state.paymentSettlements = payload;
    },
    setOrders(state, payload) {
      state.loadedOrders = payload;
    },
    setRunningId(state, payload) {
      state.runningOrderId = payload;
      localStorage.setItem('smart_running_order', payload);
    },
    setRunningOrder(state, payload) {
      state.runningOrder = payload;
    },
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
    loading(state, payload) {
      state.loading = payload;
    },
  },
  actions: {

    post({ commit }, payload) {
      commit('toggleLoading', true);
      const params = new FormData();
      const updateKeys = Object.keys(payload);
      updateKeys.forEach((key) => {
        params.append(key, payload[`${key}`]);
      });
      commit('toggleLoading', false);
      return API.smart(PATH, params);
    },

    setWorkingTable({ commit }, payload) {
      commit('setWorkingTable', payload);
    },
    setRunningOrderId({ commit }, payload) {
      commit('setRunningId', payload);
    },

    setRunningOrder({ commit }, payload) {
      commit('setRunningOrder', payload);
    },

    createNewOrder({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('create_new_order', payload.company_id);
      filters.append('user_id', payload.user_id);
      filters.append('date', payload.date);
      filters.append('time', payload.time);
      filters.append('table_id', payload.table_id);
      filters.append('outlet_id', payload.outlet_id);
      commit('toggleLoading', false);
      return API.smart(PATH, filters);
    },

    toggleLoad({ commit }, payload) {
      commit('toggleLoading', payload);
    },

    async getMenuItems({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('get_menu_items', payload.category_id);
      filters.append('company_id', localStorage.getItem('smart_company_id'));
      filters.append('item_name', payload.item_name);
      const menuItems = await API.smart(PATH, filters);
      if (!menuItems.error) commit('setMenuItems', menuItems.data);
      if (payload.category_id !== 'download') commit('toggleLoading', false);
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
      if (!categories.error) commit('setCategories', [{ id: 0, name: 'ALL', status: '0' }, ...categories.data]);
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

    addOrderItem({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      const params = Object.keys(payload);
      params.forEach((param) => {
        filters.append(param, payload[param]);
      });
      const addItem = API.smart(PATH, filters);
      commit('toggleLoading', false);
      return addItem;
    },

    updateRunningOrder({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      const params = Object.keys(payload);
      params.forEach((param) => {
        filters.append(param, payload[param]);
      });
      const addItem = API.smart(PATH, filters);
      commit('toggleLoading', false);
      return addItem;
    },

    async filterOrders({ commit }, payload) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('find_bill', payload.bill_no);
      filters.append('from', payload.from);
      filters.append('to', payload.to);
      filters.append('status', payload.status || 0);
      filters.append('client_id', payload.client_id);
      filters.append('company_id', localStorage.getItem('smart_company_id'));

      const Orders = await API.smart(SALES, filters);
      if (!Orders.error && !payload.running) commit('setOrders', Orders.data.orders);
      commit('toggleLoading', false);
      return Orders;
    },

    async fetchsetpaymentSettlements({ commit }) {
      commit('toggleLoading', true);
      const filters = new FormData();
      filters.append('fetch_payment_settlements', true);
      const settlements = await API.smart(PATH, filters);
      if (!settlements.error) commit('setpaymentSettlements', settlements.data);
      commit('toggleLoading', false);
    },

    updateOrder({ commit }, payload) {
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
  getters: {
    loading: (state) => state.loading,
    menuItems: (state) => state.menuItems,
    departments: (state) => state.departments,
    categories: (state) => state.menuCategories,
    runningOrder: (state) => state.runningOrder,
    runningOrderId: (state) => state.runningOrderId,
    orders: (state) => state.loadedOrders,
  },
};
