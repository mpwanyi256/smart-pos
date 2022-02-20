<template>
    <div class="pos_home">
        <NavBar />
        <div class="sales_view">
            <Orders />
            <MenuSection />
            <SelectedOrder />
            <Actions
              @discount="showDiscount = true"
            />
        </div>
      <BillModal
        v-if="showBill && runningOrder"
        :order="runningOrder"
        @close="showBill = false"
      />
      <AddDiscountModal
        v-if="showDiscount"
        @close="showDiscount = false"
      />
      <OrderSettlementModal
        v-if="openSettementModal"
        @close="openSettementModal = false"
      />
      <WaitersModal
        v-if="showWaiters"
        :order="runningOrder"
        @close="showWaiters = false"
      />
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import NavBar from '@/components/nav/Navbar.vue';
import Orders from '@/views/pos/Orders.vue';
import MenuSection from '@/views/pos/MenuSection.vue';
import Actions from '@/views/pos/Actions.vue';
import BillModal from '@/components/sales/modals/Bill.vue';
import SelectedOrder from '@/views/pos/SelectedOrder.vue';
import AddDiscountModal from '@/components/pos/order/AddDiscountModal.vue';
import OrderSettlementModal from '@/components/pos/order/OrderSettlementModal.vue';
import WaitersModal from '@/components/pos/order/AddWaiterModel.vue';
import CloudMixin from '@/mixins/CloudMixin';

export default {
  name: 'SmartSalesHome',
  mixins: [CloudMixin],
  components: {
    NavBar,
    Orders,
    MenuSection,
    Actions,
    SelectedOrder,
    BillModal,
    AddDiscountModal,
    OrderSettlementModal,
    WaitersModal,
  },
  data() {
    return {
      dayOpenPoll: null,
      showBill: false,
      showDiscount: false,
      openSettementModal: false,
      showWaiters: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('pos', ['runningOrder', 'runningOrderId']),

    daysLeft() {
      return this.user ? this.user.company_info.days_left : '';
    },
  },
  eventBusCallbacks: {
    'view-bill': 'viewBill',
    'open-settlement-modal': 'settleBill',
    'add-waiter': 'addWaiter',
  },
  methods: {
    addWaiter() {
      if (this.runningOrder) this.showWaiters = true;
    },

    viewBill() {
      this.showBill = true;
    },

    settleBill() {
      this.$nextTick(() => {
        this.openSettementModal = true;
      });
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/pos.scss';

  .pos_home {
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background-color: $bg_color;
      font-size: 14px;
      font-family: $font-style;

      ::-webkit-scrollbar{
        width: 5px;
        height: 5px;
      }

      ::-webkit-scrollbar-thumb {
          background: $scrollbar-color;
          border-radius: 1ex;
          -webkit-border-radius: 1ex;
      }

      ::-webkit-scrollbar-corner {
          background: #000;
      }

      .sales_view {
          height: calc(100vh - 52px);
          display: grid;
          grid-template-columns: 15% 50% 25% 10%;

          >div {
            height: calc(100vh - 50px);
            width: 100%;
          }
      }
  }
</style>
