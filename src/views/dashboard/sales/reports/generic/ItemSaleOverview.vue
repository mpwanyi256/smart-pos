<template>
    <div class="item-wrapper">
      <div class="item-info">
        <!-- <p>Item Sale overview</p> -->
        <h3>{{ item.item_name }}</h3>
        <h4>Item Average cost price: <strong>{{ item.average_cost_price_clean }}</strong></h4>
        <p class="duration">{{ `Duration: ${duration.from} to ${duration.to}` }}</p>
      </div>
      <Table>
        <template slot="header">
          <tr>
            <th>Waiter</th>
            <th>Quantity Sold</th>
            <th>Cost Of Sale</th>
          </tr>
        </template>
        <template slot="body">
          <tr v-for="(record, idx) in records" :key="`record-sale-${idx}`">
            <td>{{ record.full_name }}</td>
            <td>{{ record.quantity }}</td>
            <td>{{ record.quantity * item.average_cost_price_clean }}</td>
          </tr>
        </template>
          <tr>
            <td><strong>Total Items</strong></td>
            <td><strong>{{ item.quantity_sold }}</strong></td>
          </tr>
      </Table>
    </div>
</template>
<script>
import Table from '@/components/generics/new/Table.vue';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'ItemSaleOverview',
  components: {
    Table,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    duration: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      records: [],
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
  },
  created() {
    this.fetchRecords();
  },
  methods: {
    ...mapActions('sales', ['filterSales']),

    fetchRecords() {
      const filters = {
        get_item_sales_overview: 'sales',
        menu_item_id: this.item.item_id,
        company_id: this.user.company_id,
        from: this.duration.from_clean,
        to: this.duration.to_clean,
      };

      this.filterSales(filters)
        .then((response) => {
          this.records = response.data;
          console.log('response', response);
        })
        .catch((e) => {
          console.error('Error in fetchRecords', e);
        });
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.item-wrapper {
    min-height: 100px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;

    .item-info {
      padding: 15px;
      background-color: $blue-disabled;
      p {
        margin: 0;
      }

      .duration {
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        color: $black;
      }
    }

    .totals {
        min-height: 56px;
        // background-color: $blue-disabled; //$accent;
        display: flex;
        flex-direction: column;
        // padding: 15px;

        h3 {
          color: $dark-blue;
          top: 0;
          margin: 0;
          line-height: 1.5;
          font-weight: bold;
        }
    }
}
</style>
