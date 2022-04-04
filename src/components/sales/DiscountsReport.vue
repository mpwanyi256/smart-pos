<template>
    <div class="find_bill">
      <div class="header_nav">
        <div>
            <h3>Discounted bills</h3>
        </div>
        <div class="search_filter">
            <div class="bill_no">
                <DatePickerBeta @picked="setDateFrom" :message="'From'" />
            </div>
            <div class="bill_no">
                <DatePickerBeta @picked="setDateTo" :message="'To'" />
            </div>
            <div class="bill_no">
                <v-btn small @click="fetchDiscounts">Search</v-btn>
            </div>
        </div>
      </div>
      <div class="orders_table">
          <LinearLoader v-if="loading" />
          <v-btn
            v-if="discounts.length > 0"
            small
            @click="exportToExcel"
            class="mt-2 ml-2 mb-2 green--text darken-4">
            <v-icon left color="green darken-4">mdi-file-excel</v-icon>
            {{ `Export ${discounts.length} items to csv` }}
          </v-btn>
          <Table>
            <template slot="header">
                  <tr>
                      <th>Bill No</th>
                      <th>DATE</th>
                      <th>AMOUNT</th>
                      <th>Discounted By</th>
                      <th>REASON</th>
                      <th>&nbsp;</th>
                  </tr>
            </template>
            <template slot="body">
              <tr v-for="discount in discounts" :key="`discount-${discount.bill_no}`">
                  <td>{{ discount.bill_no }}</td>
                  <td>{{ discount.date }}</td>
                  <td>{{ discount.amount_display }}</td>
                  <td>{{ discount.discounted_by }}</td>
                  <td>{{ discount.reason }}</td>
                  <td>
                      <v-btn class="ml-1" small @click="viewBill(discount)">Bill</v-btn>
                  </td>
              </tr>
            </template>
          </Table>
          <Bill
            v-if="showBillModal && selectedOrder"
            :order="selectedOrder"
            @close="showBillModal = false"
          />
      </div>
  </div>
</template>
<script>
import { mapActions } from 'vuex';
import DatePickerBeta from '@/components/generics/DatePickerBeta.vue';
import Table from '@/components/generics/new/Table.vue';
import LinearLoader from '@/components/generics/Loading.vue';
import Bill from '@/components/sales/modals/Bill.vue';
import ExcelExportMixin from '@/mixins/excelMixin';

export default {
  name: 'DiscountsReport',
  mixins: [ExcelExportMixin],
  components: {
    DatePickerBeta,
    Table,
    LinearLoader,
    Bill,
  },
  data() {
    return {
      billNumber: '',
      dateFrom: '',
      dateTo: '',
      discounts: [],
      selectedOrder: null,
      showOrderDetails: false,
      showBillModal: false,
      loading: false,
    };
  },
  methods: {
    ...mapActions('sales', ['filterSales']),

    exportToExcel() {
      const dataCleaned = this.discounts.map((Order) => (
        {
          bill: Order.bill_no,
          date: Order.date,
          amount: Order.amount_display,
          discounted_by: Order.discounted_by,
          reason: Order.reason,
        }));
      this.exportDataToExcel(dataCleaned, 'discounts_smart_pos');
    },
    async fetchDiscounts() {
      if (this.loading) return;
      this.loading = true;
      const filters = {
        from: this.dateFrom,
        to: this.dateTo,
        company_id: localStorage.getItem('smart_company_id'),
        fetch_discounts: 'all',
      };
      const Orders = await this.filterSales(filters);
      this.discounts = Orders.data;
      this.totalDiscounts = Orders.total_discounts;
      this.loading = false;
    },

    viewBill(order) {
      this.selectedOrder = order;
      this.showBillModal = true;
    },

    setDateFrom(dateSelected) {
      this.dateFrom = dateSelected;
    },

    setDateTo(dateSelected) {
      this.dateTo = dateSelected;
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
      display: flex;
      flex-direction: column;

      .header_nav {
          min-height: 56px;
          width: 100%;
          padding: 5px;
          border-bottom: 0.5px solid $border-color;
          display: grid;
          grid-template-columns: 40% 60%;
          justify-content: center;

          > div {
              display: inline-flex;
              align-items: center;
          }

          .search_filter {
              height: 100%;
              width: 100%;
              display: inline-flex;
              align-items: center;

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

      }
  }
</style>
