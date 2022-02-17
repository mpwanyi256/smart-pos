<template>
    <div class="sales-dashboard">
        <div class="overview">
            <div v-for="dep in departmentSales" :key="dep.id">
                <p class="name">{{ dep.name }}</p>
                <p class="amount">{{ dep.amount_display }}</p>
            </div>
        </div>
        <div class="stats">
            <SettlementsOverview :settlements="paymentSettlements" />
            <RunningOrdersOverview
              :orders="runningOrers"
              @fetch-more="fetchMoreRunningOrders"
              :has-more="hasMore"
            />
            <WaitersOverview :waiters="waitersOverview" />
        </div>
    </div>
</template>
<script>
import WaitersOverview from '@/components/sales/WaitersOverview.vue';
import SettlementsOverview from '@/components/sales/SettlementsOverview.vue';
import RunningOrdersOverview from '@/components/sales/RunningOrdersOverview.vue';
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'SalesDashboard',
  components: {
    WaitersOverview,
    SettlementsOverview,
    RunningOrdersOverview,
  },
  data() {
    return {
      paymentSettlements: [],
      waitersOverview: [],
      departmentSales: [],
      orders: [],
      runningOrers: [],
      page: 1,
      fetchingOrders: false,
      itemsPerPage: 10,
      hasMore: true,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
  },
  async created() {
    await this.fetchDepartmentSales();
    await this.fetchSettlementsSammary();
    await this.fetchWaitersOverview();
    await this.fetchOrders();
  },
  methods: {
    ...mapActions('sales', ['post']),
    ...mapMutations('sales', ['setSale']),

    fetchMoreRunningOrders() {
      this.page += 1;
      this.fetchOrders(true);
    },

    fetchOrders(more = false) {
      if (this.fetchingOrders || !this.hasMore) return;
      if (more) this.page += 1;
      this.fetchingOrders = true;
      const payload = {
        find_bill: 0,
        from: this.user.company_info.day_open,
        to: this.user.company_info.day_open,
        company_id: this.user.company_id,
        page: this.page,
        settlement_type: 0,
        client_id: 0,
        status: 'pending',
      };
      this.post(payload)
        .then((response) => {
          this.runningOrers = [...this.runningOrers, ...response.data.orders];
          // eslint-disable-next-line camelcase
          const { total_items, page } = response;
          // eslint-disable-next-line camelcase
          const totalPages = Math.ceil(total_items / this.itemsPerPage);
          if (page < totalPages) {
            this.hasMore = true;
          } else {
            this.hasMore = false;
          }
        })
        .catch((e) => {
          console.error('Error in fetchSettlementsSammary', e);
        })
        .finally(() => {
          this.fetchingOrders = false;
        });
    },

    fetchDepartmentSales() {
      const payload = {
        get_department_sales_overview: 'daily',
        company_id: this.user.company_id,
        from: this.user.company_info.day_open,
        to: this.user.company_info.day_open,
      };
      this.post(payload)
        .then((response) => {
          this.departmentSales = response.data;
        })
        .catch((e) => {
          console.error('Error in fetchSettlementsSammary', e);
        });
    },

    fetchWaitersOverview() {
      const payload = {
        get_waiters_overview: 'daily',
        company_id: this.user.company_id,
        from: this.user.company_info.day_open,
        to: this.user.company_info.day_open,
      };
      this.post(payload)
        .then((response) => {
          this.waitersOverview = response.data;
        })
        .catch((e) => {
          console.error('Error in fetchSettlementsSammary', e);
        });
    },

    fetchSettlementsSammary() {
      const payload = {
        get_daily_settlements: 'daily',
        company_id: this.user.company_id,
        sales_date: this.user.company_info.day_open,
      };
      this.post(payload)
        .then((response) => {
          this.paymentSettlements = response.data;
          this.setSale(response.total_amount_display);
        })
        .catch((e) => {
          console.error('Error in fetchSettlementsSammary', e);
        });
    },
  },
};
</script>
<style lang="scss">
@import '@/styles/constants.scss';

.sales-dashboard {
    height: calc(100vh - 52px);
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 15px;

    .overview {
        height: 104px;
        background-color: inherit;
        border: 0.5px solid $border-color;
        border-radius: 8px;
        box-shadow: $elevation-low;
        display: flex;
        flex-direction: row;
        gap: 5px;

        > div {
            width: 100%;
            padding: 5px;
            border: 0.5px solid $border-color;
            background-color: $white !important;

            .name {
                color: $black;
                font-weight: 400;
            }

            .amount {
                color: $accent;
                font-size: 16px;
                font-weight: bold;
            }
        }
    }

    .stats {
        display: grid;
        grid-template-columns: 20% 60% 20%;
        height: calc(100vh - 156px);
        background-color: $white;
        margin-top: 10px;
        border: 0.5px solid $border-color;
        // box-shadow: $elevation-low;
    }
}

</style>
