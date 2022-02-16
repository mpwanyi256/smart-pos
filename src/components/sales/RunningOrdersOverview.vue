<template>
    <div class="running-orders-overview">
        <OverviewHeader title="Running Orders" />
        <div class="orders">
            <Table>
                <template slot="header">
                <tr>
                  <th>#</th>
                  <th>Table</th>
                  <th>Waiter</th>
                  <th>Amount</th>
                  <th>&nbsp;</th>
                </tr>
              </template>
              <template slot="body">
                <tr v-for="order in orders" :key="order.bill_no">
                    <td>{{ order.bill_no }}</td>
                    <td>{{ order.table }}</td>
                    <td>{{ order.waiter }}</td>
                    <td>{{ order.final_amount }}</td>
                    <td>
                        <v-btn small @click="viewOrderDetails(order)">View</v-btn>
                    </td>
                </tr>
              </template>
            </Table>
        </div>
        <BillModal
          v-if="showBill"
          :order="selectedOrder"
          @close="showBill = false"
        />
    </div>
</template>
<script>
import Table from '@/components/generics/new/Table.vue';
import BillModal from '@/components/sales/modals/Bill.vue';
import OverviewHeader from '@/components/sales/OverviewHeader.vue';

export default {
  name: 'RunningOrdersOverview',
  components: {
    Table,
    OverviewHeader,
    BillModal,
  },
  props: {
    orders: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      showBill: false,
      selectedOrder: null,
    };
  },
  methods: {
    viewOrderDetails(order) {
      this.showBill = true;
      this.selectedOrder = order;
    },
  },
};
</script>
<style lang="scss">
@import '@/styles/constants.scss';

.running-orders-overview {
    min-height: 100%;
    background-color: $body-bg;
    border-right: 0.5px solid $gray-80;

    .orders {
        max-height: calc(100% - 32px);
        overflow-y: auto;
    }
}

</style>
