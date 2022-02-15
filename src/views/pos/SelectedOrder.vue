<template>
    <div class="selected_order">
      <RunningOrder
        class="running_order"
        :order="runningOrder"
      />
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import RunningOrder from '@/components/pos/order/RunningOrder.vue';

export default {
  name: 'SelectedOrder',
  components: {
    RunningOrder,
  },
  data() {
    return {
      runningOrder: null,
    };
  },
  eventBusCallbacks: {
    'get-order-details': 'fetchOrderDetails',
  },
  methods: {
    ...mapActions('sales', ['filterOrders']),

    fetchOrderDetails(orderId) {
      const filters = {
        from: localStorage.getItem('smart_company_day_open'),
        to: localStorage.getItem('smart_company_day_open'),
        client_id: 0,
        bill_no: orderId,
        company_id: localStorage.getItem('smart_company_id'),
        settlement_type: '',
        page: 1,
      };
      this.filterOrders(filters)
        .then((Orders) => {
          this.runningOrder = { ...Orders.data.orders[0] };
          this.$eventBus.$emit('fetch-items');
        })
        .catch((e) => {
          console.error('Error in SelectOrder component', e);
        });
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/pos.scss';

    .selected_order {
        height: calc(100% - 52px);
        display: flex;
        flex-direction: column;
        gap: 10px;
        justify-content: top;
        align-items: center;
        padding-left: 5px;
        padding-right: 5px;

        .running_order {
            width: 100%;
            height: 100%;
        }
    }

</style>
