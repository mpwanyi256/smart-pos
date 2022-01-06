<template>
    <div class="menu_categories">
      <Categories
        :categories="filteredCategories"
        @filterMenu="filterMenuByCategory"
        @search="categorySearchKey = $event"
        :loading="loading"
      />
      <MenuItems
        :items="filteredMenuItems"
        :loading="loading"
        @searchMenu="searchForAMenuItem"
        @create-order="createOrder"
        @addItem="addItemToOrder"
      />
      <ItemQuantity
        v-if="showQuantityModal && selectedMenuItem"
        :menuItem="selectedMenuItem"
        @close="showQuantityModal = false"
        @add="addItemToSelectedOrder"
      />
    </div>
</template>
<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import Categories from '@/components/pos/menu/Categories.vue';
import MenuItems from '@/components/pos/menu/MenuItems.vue';
import ItemQuantity from '@/components/pos/order/ItemOrderQuantity.vue';
import TimezoneMixin from '@/mixins/TimezoneMixin';

import idb from '@/mixins/idb';

const IDB_MENU_KEY = 'smart_pos_menu_sync';
// const IDB_MENU_CATEGORIES_KEY = 'smart_pos_menu_categories_sync';

export default {
  name: 'MenuSection',
  components: {
    Categories,
    MenuItems,
    ItemQuantity,
  },
  mixins: [
    TimezoneMixin,
  ],
  data() {
    return {
      categorySearchKey: '',
      quantity: 1,
      loading: true,
      selectedMenuItem: null,
      showQuantityModal: false,
      cachedMenuItems: [],
    };
  },
  computed: {
    ...mapGetters('pos', ['menuItems', 'categories', 'runningOrderId', 'orders']),
    ...mapGetters('auth', ['user']),
    ...mapState('pos', ['selectedTableId']),

    userRole() {
      return this.user ? this.user.role : 0;
    },

    companyType() {
      return this.user ? this.user.business_type : 0;
    },

    filteredMenuItems() {
      return this.menuItems.filter((Item) => Item.status === 0);
    },

    dayOpen() {
      return this.user ? this.user.company_info.day_open : null;
    },

    filteredCategories() {
      return this.categories.filter((Cat) => Cat.name.toLowerCase()
        .match(this.categorySearchKey.toLowerCase())
        && Cat.status === '0');
    },
  },

  eventBusCallbacks: {
    'create-table-order': 'createTableOrder',
  },

  methods: {
    ...mapActions('pos', ['getMenuItems', 'getMenuCategories', 'setRunningOrder',
      'createNewOrder', 'addOrderItem', 'setRunningOrderId', 'filterOrders',
      'setWorkingTable']),

    fetchCachedMenuItems() {
      idb.collection(IDB_MENU_KEY)
        .get()
        .then((res) => {
          if (res && res.data_key) {
            this.cachedMenuItems = [...res.items, { id: 0, name: 'ALL', status: '0' }];
          }
        }).catch((e) => {
          console.log('Error in fetching cached menu', e);
        });
    },

    async createTableOrder(payload) {
      const order = await this.createNewOrder({
        ...payload,
        company_id: this.user.company_id,
        outlet_id: this.user.outlet_id,
        user_id: this.userRole === 3 ? this.user.id : 0,
        date: this.dayOpen,
        time: this.time,
      });
      if (!order.error) {
        await this.$eventBus.$emit('fetch-orders');
        this.setRunningOrderId(order.order_id);
        this.filterOrders({
          bill_no: order.order_id,
          from: '',
          to: '',
          client_id: '',
        }).then((orders) => {
          const OrderFetched = orders.data.orders;
          if (!OrderFetched.length) return;
          this.setRunningOrder(OrderFetched[0]);
          this.$eventBus.$emit('toggle-running', order.order_id);
          this.$eventBus.$emit('reload-order', order.order_id);
        });
      } else console.info(order.message);
    },

    async addItemToSelectedOrder(quantity) {
      const filters = {
        order_id: this.runningOrderId,
        menu_item_id: this.selectedMenuItem.id,
        item_unit_price: this.selectedMenuItem.price,
        menu_item_price: (this.selectedMenuItem.price * quantity),
        quantity,
        notes: '',
        status: 0,
        added_by: this.user.id,
        add_order_item: this.runningOrderId,
        time: this.time,
      };
      const addItem = await this.addOrderItem(filters);
      if (addItem.error) console.info(addItem.message);
      else {
        this.showQuantityModal = false;
        this.$eventBus.$emit('reload-order', this.runningOrderId);
      }
    },

    async addItemToOrder(menuItem) {
      if (!this.runningOrderId) return;
      this.selectedMenuItem = menuItem;

      if (this.companyType === 1) {
        this.addItemToSelectedOrder(1);
        return;
      }
      this.showQuantityModal = true;
    },

    async createOrder() {
      if (!this.user) return;
      const filters = {
        company_id: this.user.company_id,
        user_id: this.user.id,
        outlet_id: this.user.outlet_id,
        date: this.dayOpen,
        time: this.time,
        table_id: 'default',
      };
      const order = await this.createNewOrder(filters);
      await this.$eventBus.$emit('fetch-orders');
      if (!order.error) {
        this.setRunningOrderId(order.order_id);
        const orders = await this.filterOrders({
          bill_no: order.order_id,
          from: '',
          to: '',
          client_id: '',
          company_id: this.user.company_id,
        });

        const OrderFetched = orders.data.orders;
        if (!OrderFetched.length) return;
        this.setRunningOrder(OrderFetched[0]);
        this.$eventBus.$emit('reload-order');
      } else console.info(order.message);
    },

    searchForAMenuItem(searchKey) {
      setTimeout(() => {
        this.getMenuItems({ category_id: 'all', item_name: searchKey.trim() });
      }, 1000);
    },

    filterMenuByCategory(categoryId) {
      this.getMenuItems({ category_id: categoryId, item_name: 'all' });
    },
  },
  async created() {
    this.$nextTick(async () => {
      this.loading = true;
      // this.fetchCachedMenuItems();
      await this.getMenuItems({ category_id: 'all', item_name: 'all' });
      await this.getMenuCategories();
      this.loading = false;
    });
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/pos.scss';

    .menu_categories {
        width: 100%;
        height: calc(100% - 52px);
        display: flex;
        flex-direction: column;
        gap: 1px;
        overflow-x: hidden;
        overflow-y: auto;
        background-color: inherit;
        box-shadow: $elevation-default;
    }

</style>
