<template>
    <Table>
        <template slot="header">
            <tr>
            <th>Bill</th>
            <th>Date</th>
            <th>Time</th>
            <th>Table</th>
            <th>Served By</th>
            <th>Amount</th>
            <th>Discount</th>
            <th>Settlement</th>
            <th>Payment Mode</th>
            <th>Client</th>
            <th>&nbsp;</th>
            </tr>
        </template>
        <template slot="body">
            <tr v-for="Order in orders" :key="Order.bill_no">
                <td>{{ Order.bill_no }}</td>
                <td>{{ Order.date }}</td>
                <td>{{ Order.time }}</td>
                <td>{{ Order.table }}</td>
                <td>{{ Order.waiter }}</td>
                <td>{{ Order.bill_sum_display }}</td>
                <td>{{ Order.discount }}</td>
                <td>{{ Order.final_amount }}</td>
                <td>{{ Order.settlement }}</td>
                <td>{{ Order.client_info.firstname }}</td>
                <td>
                  <BaseTooltip
                    @button="$emit('view', Order)"
                    message="View Bill"
                    icon="note-outline"
                  />
                  <BaseTooltip
                    class="ml-3"
                    @button="$emit('settlements', Order)"
                    message="View settlements"
                    icon="credit-card-outline"
                  />
                  <!-- <v-btn small @click="$emit('view', Order)">Details</v-btn>
                  <v-btn small @click="$emit('view', Order)">View</v-btn> -->
                </td>
            </tr>
        </template>
    </Table>
</template>
<script>
import Table from '@/components/generics/new/Table.vue';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';

export default {
  name: 'BillsTable',
  components: {
    Table,
    BaseTooltip,
  },
  props: {
    orders: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      viewOptions: [
        { name: 'Bill', ref: 'view' },
        { name: 'Details', ref: 'info' },
      ],
      selectedOption: '',
    };
  },
  watch: {
    selectedOption(val) {
      this.$nextTick(() => {
        console.log('View', val);
      });
    },
  },
};
</script>
<style scoped>
  ::v-deep .v-input {
    width: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    top: 0 !important;
  }
</style>
