<template>
    <Basemodal
      :title="`Bill ${order.bill_no} settlements`"
      :size="1000" @close="$emit('close')">
        <div class="settlements">
            <LoadingSpinner class="large" v-if="loading" />
            <Table v-else>
                <template #header>
                    <tr>
                        <th>Bill</th>
                        <th>Amount</th>
                        <th>Payment Mode</th>
                        <th>Settled By</th>
                        <th>Notes</th>
                    </tr>
                </template>
                <template #body>
                <tr v-for="record in settlements" :key="`cancelled-${record.id}`">
                    <td>{{ record.bill_number }}</td>
                    <td>{{ record.amount }}</td>
                    <td>{{ record.payment_mode }}</td>
                    <td>{{ record.settled_by }}</td>
                    <td>{{ record.notes }}</td>
                </tr>
            </template>
            </Table>
        </div>
    </Basemodal>
</template>
<script>
import { mapActions } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import LoadingSpinner from '@/components/generics/LoadingSpinner.vue';
import Table from '@/components/generics/new/Table.vue';

export default {
  name: 'BillSettlements',
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  components: {
    Basemodal,
    LoadingSpinner,
    Table,
  },
  data() {
    return {
      settlements: [],
      loading: false,
    };
  },
  created() {
    this.fetchOrderSettlements();
  },
  methods: {
    ...mapActions('sales', ['post']),

    fetchOrderSettlements() {
      this.loading = true;
      this.post({
        get_order_settlements: this.order.order_id,
      })
        .then((response) => {
          this.settlements = response.data;
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style scoped>
.settlements {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    top: 0;
    bottom: 0;
}
</style>
