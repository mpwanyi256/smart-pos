<template>
    <div class="item-wrapper">
      <div class="item-info">
        <h3>{{ item.item_name }}</h3>
        <h4>Item average cost price: <strong>{{ item.average_cost_price_clean }}</strong></h4>
        <p class="duration">{{ `Duration: ${duration.from} to ${duration.to}` }}</p>
        <p class="duration">{{`${item.quantity_sold} items sold`}}</p>
      </div>
      <div class="sales-info">
        <LoadingSpinner v-if="loading" class="large" />
        <Table v-else>
          <template #header>
            <tr>
              <th>#</th>
              <th>Waiter</th>
              <th>Quantity Sold</th>
              <th>Cost Of Sale</th>
            </tr>
          </template>
          <template #body>
            <tr v-for="(record, idx) in records" :key="`record-sale-${idx}`">
              <td>{{ ++idx }}</td>
              <td>{{ record.full_name }}</td>
              <td>{{ record.quantity }}</td>
              <td>{{ record.quantity * item.average_cost_price_clean }}</td>
            </tr>
          </template>
            <tr class="item-info">
              <td>&nbsp;</td>
              <td><strong>Total Items</strong></td>
              <td><strong>{{ item.quantity_sold }}</strong></td>
              <td><strong>{{ item.quantity_sold * item.average_cost_price_clean }}</strong></td>
            </tr>
        </Table>
      </div>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Table from '@/components/generics/new/Table.vue';
import LoadingSpinner from '@/components/generics/LoadingSpinner.vue';

export default {
  name: 'ItemSaleOverview',
  components: {
    Table,
    LoadingSpinner,
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
      loading: true,
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
      this.loading = true;
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
        })
        .catch((e) => {
          console.error('Error in fetchRecords', e);
        })
        .finally(() => {
          this.loading = false;
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
    color: $black;

    .sales-info {
      min-height: 250px;
    }

    .item-info {
      padding: 15px;
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
