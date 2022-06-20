<template>
    <div class="runnning_order">
      <PageAlert v-if="errorMessage" :message="errorMessage" @close="errorMessage= ''" />
        <div class="order_header" v-if="order">
            <h2>
              <span v-if="companyType == 1">{{ order.table }}</span>
              #{{ order.bill_no }}</h2>
            <div class="date_and_time">
                <p>
                    {{ order.date }}
                    <span>
                        <v-icon small class="clock_icon">mdi-clock-outline</v-icon>
                    </span>
                    {{ order.time }}
                    <span v-if="order.waiter">
                      <v-icon small class="clock_icon">mdi-account-outline</v-icon>
                      {{ order && order.waiter ? order.waiter.split(' ')[0] : '' }}
                    </span>
                    <span v-if="clientName">
                      {{ clientName }}
                    </span>
                    <span v-if="companyType == 1">
                      <BaseTooltip
                        :small="true"
                        @button="shift = true"
                        color="black"
                        message="Shift table"
                        icon="arrow-expand"
                      />
                    </span>
                </p>
            </div>
        </div>
        <OrderListHeader />
        <div class="items_list">
            <div class="items">
                <OrderItem
                  v-for="item in orderItems"
                  :key="item.id"
                  :item="item"
                  @viewItems="viewPendingItems"
                />
            </div>
        </div>
        <div class="order_sum_info">
            <OrderTotalCacular
              v-if="order"
              :order="order"
              :show-vat="showVatCalcular"
            />
            <OrderItemsList
              v-if="showItems && orderItemSelected"
              @close="showItems = false"
              :item="orderItemSelected"
            />
        </div>
        <ShiftTable
          v-if="shift"
          @close="shift = false"
          @shift="shiftOrder"
        />
    </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import OrderItem from '@/components/pos/order/OrderItem.vue';
import OrderListHeader from '@/components/pos/order/OrderListHeader.vue';
import OrderTotalCacular from '@/components/pos/order/OrderTotalCacular.vue';
import OrderItemsList from '@/components/pos/order/OrderItemsList.vue';
import PageAlert from '@/components/alerts/PageAlert.vue';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import ShiftTable from '@/components/pos/order/manage/ShiftTable.vue';
import ControlsMixin from '@/mixins/ControlsMixin';

export default {
  name: 'RunningOrder',
  mixins: [ControlsMixin],
  props: {
    order: {
      type: Object,
      required: false,
    },
  },
  components: {
    OrderItem,
    OrderListHeader,
    OrderTotalCacular,
    OrderItemsList,
    PageAlert,
    BaseTooltip,
    ShiftTable,
  },
  data() {
    return {
      orderItems: [],
      showItems: false,
      orderItemSelected: null,
      errorMessage: '',
      shift: false,
    };
  },
  computed: {
    ...mapGetters('pos', ['runningOrderId', 'orders']),
    ...mapGetters('auth', ['user']),

    // order() {
    //   return this.runningOrder;
    // },

    outletId() {
      return this.user.outlet_id;
    },

    itemsCount() {
      return this.orderItems.length;
    },

    clientName() {
      const name = this.order.client_info.firstname;
      return name || '';
    },

    companyType() {
      return this.user ? this.user.company_info.business_type : 0;
    },

    orderId() {
      return this.runningOrder ? this.runningOrder.order_id : null;
    },

    isPending() {
      return this.orderItems.filter((Order) => Order.status === 0).length > 0;
    },
  },

  watch: {
    orderId(val) {
      if (val) {
        this.$nextTick(async () => {
          await this.$eventBus.$emit('reload-order', val);
          await this.fetchOrderItems();
        });
      }
    },
    itemsCount() {
      this.$nextTick(async () => {
        await this.reloadOrderDisplay();
      });
    },

    errorMessage(val) {
      if (!val) return;
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    },
  },

  created() {
    if (this.order) this.fetchOrderItems();
  },

  eventBusCallbacks: {
    'fetch-items': 'fetchOrderItems',
    'print-bill': 'checkOrderStatus',
    'trigger-error': 'showErrorAlert',
    'settle-bill': 'settleBill',
    'reset-running-order': 'reloadOrderDisplay',
    'clear-running-order-items': 'clearItems',
  },

  methods: {
    ...mapActions('sales', ['getOrderItems']),
    ...mapActions('pos', ['updateOrder', 'filterOrders', 'setRunningOrder', 'post']),
    ...mapMutations('pos', ['setRunningOrder', 'setRunningId']),

    clearItems() {
      this.orderItems = [];
      this.setRunningOrder(null);
      this.setRunningId(null);
    },

    reloadOrderDisplay() {
      if (!this.order) return;
      try {
        this.filterOrders({
          bill_no: this.order.order_id,
          from: '',
          to: '',
          client_id: '',
          outlet_id: this.outletId,
          running: true,
        }).then((orders) => {
          const OrderFetched = orders.data.orders;
          if (!OrderFetched.length) return;
          this.setRunningOrder(OrderFetched[0]);
        });
      } catch (e) {
        console.log('Error in reloadOrderDisplay', e);
      }
    },

    shiftOrder(tableId) {
      const filter = {
        shift_order_to_table: tableId,
        order_id: this.order.order_id,
      };
      this.updateOrder(filter)
        .then((response) => {
          if (!response.error) this.$eventBus.$emit('reload-order');
          this.shift = false;
        })
        .catch((e) => {
          console.error('error in shiftOrder', e);
        })
        .finally(() => {

        });
    },

    showErrorAlert(msg) {
      this.errorMessage = msg;
      this.$eventBus.$emit('show-snackbar', msg);
    },

    settleBill() {
      if (!this.isPending) this.$eventBus.$emit('open-settlement-modal');
      else this.$eventBus.$emit('show-snackbar', 'Please confirm pending items.');
    },

    checkOrderStatus() {
      if (!this.isPending) this.$eventBus.$emit('view-bill');
      else this.$eventBus.$emit('show-snackbar', 'Please confirm order.');
    },

    viewPendingItems(orderItem) {
      this.post({
        check_order_status: orderItem.order_id,
      })
        .then((response) => {
          if (response.is_pending) {
            this.orderItemSelected = orderItem;
            this.showItems = true;
          } else { // if order was settled
            this.clearItems();
            this.setRunningOrder(null);
            this.setRunningId(null);
            this.$nextTick(async () => {
              this.$eventBus.$emit('show-snackbar', 'Sorry, this order was settled.');
              this.$eventBus.$emit('fetch-orders');
            });
          }
        })
        .catch(() => {
          this.$eventBus.$emit('show-snackbar', 'Sorry, Failed to connect to server.');
        });
    },

    async fetchOrderItems() {
      console.log('Fetch Running Orde');
      const items = await this.getOrderItems(this.runningOrderId);
      if (!items.error) this.orderItems = items.data.sort((a, b) => a.status - b.status);
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/pos.scss';

    .runnning_order {
        height: 100%;
        width: 100%;
        background-color: $white;
        display: flex;
        flex-direction: column;
        box-shadow: $elevation-default;
        color: $black;

        .order_header {
            height: 96px;
            background-color: $header;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding-left: 15px;
            padding-top: 10px;

            p .clock_icon {
                color: $black;
            }
        }

        .items_list {
            height: calc(100vh - 208px);
            overflow-y: auto;
            box-shadow: $elevation-default;

            .items {
                display: flex;
                flex-direction: column;
            }
        }

        .order_sum_info {
            height: 400px;
            display: flex;
            flex-direction: column;
            background-color: #d8dfe2; // $header;
        }
    }
</style>
