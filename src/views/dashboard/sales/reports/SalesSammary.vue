<template>
    <div class="find_bill">
        <div class="search_filter">
            <div class="bill_no">
                <h3>Filter sales</h3>
            </div>
            <div class="bill_no">
                <DatePickerBeta @picked="setDateFrom" :message="'From'" />
            </div>
            <div class="bill_no">
                <DatePickerBeta @picked="setDateTo" :message="'To'" />
            </div>
            <div class="bill_no">
                <v-btn small @click="fetchSales">Search</v-btn>
            </div>
        </div>
        <div class="orders_table">
          <LinearLoader v-if="loading" />
          <template v-else>
            <Table>
              <template slot="header">
                <th v-for="(header, idx) in tableHeaders" :key="idx">
                  {{ header.text }}
                </th>
              </template>
              <template slot="body">
                <tr v-for="sale in sales" :key="sale.date">
                  <td>{{ sale.date }}</td>
                  <td>{{ sale.cash }}</td>
                  <td>{{ sale.visa }}</td>
                  <td>{{ sale.mobile }}</td>
                  <td>{{ sale.company }}</td>
                  <td>{{ sale.cheque }}</td>
                  <td>{{ sale.nc }}</td>
                  <td>{{ sale.cancelled }}</td>
                </tr>
              </template>
            </Table>
          </template>
        </div>
        <Pagination @change="page = $event" :length="totalItems" />
    </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import DatePickerBeta from '@/components/generics/DatePickerBeta.vue';
import LinearLoader from '@/components/generics/Loading.vue';
import Table from '@/components/generics/new/Table.vue';
import Pagination from '@/components/generics/new/Pagination.vue';

export default {
  name: 'DashboardSalesOverview',
  components: {
    DatePickerBeta,
    LinearLoader,
    Pagination,
    Table,
  },
  data() {
    return {
      dateFrom: '',
      dateTo: '',
      sales: [],
      tableHeaders: [
        {
          text: 'DATE', value: 'date', sortable: true, align: 'start',
        },
        {
          text: 'CASH', value: 'cash', sortable: false, align: 'start',
        },
        {
          text: 'VISA', value: 'visa', sortable: false, align: 'start',
        },
        {
          text: 'Mo. Money', value: 'mobile', sortable: false, align: 'start',
        },
        {
          text: 'COMPANY', value: 'company', sortable: false, align: 'start',
        },
        {
          text: 'CHEQUE', value: 'cheque', sortable: false, align: 'start',
        },
        {
          text: 'NC', value: 'nc', sortable: false, align: 'start',
        },
        {
          text: 'CANCELLED', value: 'cancelled', sortable: false, align: 'start',
        },
      ],
      page: 1,
      totalItems: 0,
      itemsPerPage: 15,
    };
  },
  computed: {
    ...mapGetters('sales', ['loading']),
    ...mapGetters('auth', ['user']),
  },

  watch: {
    async user() {
      await this.fetchSales();
    },
    page() {
      this.fetchSales();
    },
  },

  created() {
    this.$nextTick(async () => {
      await this.fetchSales();
    });
  },

  methods: {
    ...mapActions('sales', ['fetchSalesSummary']),

    setDateFrom(dateSelected) {
      this.dateFrom = dateSelected;
    },

    setDateTo(dateSelected) {
      this.dateTo = dateSelected;
    },

    async fetchSales() {
      if (this.loading) return;
      const filters = {
        from: this.dateFrom,
        to: this.dateTo,
        page: this.page,
        items_per_page: this.itemsPerPage,
      };
      this.fetchSalesSummary(filters)
        .then((SALES) => {
          if (!SALES.error) {
            this.sales = SALES.data.map((Sale) => ({
              date: Sale.day,
              cancelled: Sale.settlement[0].amount,
              cash: Sale.settlement[1].amount,
              cheque: Sale.settlement[2].amount,
              company: Sale.settlement[3].amount,
              mobile: Sale.settlement[5].amount,
              nc: Sale.settlement[6].amount,
              visa: Sale.settlement[8].amount,
            }));

            this.totalItems = SALES.total_items;
          }
        });
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

    .find_bill {
        background-color: $white;
        font-family: $font-style;
        min-height: 100%;
        border-left: 0.5px solid $border-color;
        height: calc(100vh -52px);
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .search_filter {
            height: inherit;
            width: 100%;
            padding: 5px;
            border-bottom: 0.5px solid $border-color;
            display: inline-flex;
            flex-direction: row;
            justify-content: center;
            justify-items: center;

            > div {
                height: 100%;
                overflow: hidden;
                padding: 5px;
                width: 100%;
                justify-content: center;
                justify-self: center;
                margin-top: 20px;

                .frm_input {
                    height: 30px;
                }
            }
        }

        .orders_table {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 244px);
          overflow-y: auto;
        }
    }
</style>
