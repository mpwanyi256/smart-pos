<template>
  <div class="find_bill">
      <div class="header_nav">
          <h3>Find orders</h3>
          <v-spacer></v-spacer>
          <v-btn
            v-if="orders.length > 0"
            small
            @click="exportToExcel"
            class="mt-2 ml-2 green--text darken-4">
            <v-icon left color="green darken-4">mdi-file-excel</v-icon>
            {{ `Export ${totalItems} items to csv` }}
          </v-btn>
      </div>
      <div class="search_filter">
          <div class="bill_no">
              <v-text-field
                v-model="billNumber"
                @keyup.enter="findBill"
                dense class="frm_input"
                outlined
                label="Bill no."
              />
          </div>
          <div class="bill_no">
            <v-select
              outlined
              label="Select Client"
              v-model="selectedClient" dense
              item-text="full_name"
              item-value="id"
              :items="clientList"
            />
          </div>
          <div class="bill_no">
            <v-select
              outlined
              label="Settlement type"
              v-model="settlementType" dense
              item-text="name"
              item-value="id"
              :items="settlementOptions"
            />
          </div>
          <div class="bill_no">
              <DatePickerBeta @picked="setDateFrom" :message="'From'" />
          </div>
          <div class="bill_no">
              <DatePickerBeta @picked="setDateTo" :message="'To'" />
          </div>
          <div class="bill_no">
              <v-btn small @click="findBill">Search</v-btn>
          </div>
      </div>
      <div class="orders_table">
          <LinearLoader v-if="loading" />
          <BillsTable :orders="orders" @view="showBill($event)"/>
      </div>
      <Pagination @change="page = $event" :length="totalPaginationItems" />
      <!-- Modals -->
      <OrderDetailsModal
        v-if="showOrderDetails && selectedOrder"
        :order="selectedOrder"
        @close="showOrderDetails = false"
      />
      <BillModal
        v-if="showBillModal && selectedOrder"
        :order="selectedOrder"
        @close="showBillModal = false"
      />
      <!-- /Modals -->
  </div>
</template>
<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import DatePickerBeta from '@/components/generics/DatePickerBeta.vue';
import LinearLoader from '@/components/generics/Loading.vue';
import OrderDetailsModal from '@/components/sales/modals/OrderDetails.vue';
import BillModal from '@/components/sales/modals/Bill.vue';
import BillsTable from '@/views/dashboard/sales/reports/BillsTable.vue';
import Pagination from '@/components/generics/new/Pagination.vue';
import ExcelExportMixin from '@/mixins/excelMixin';

export default {
  name: 'FindBill',
  mixins: [ExcelExportMixin],
  components: {
    DatePickerBeta,
    Pagination,
    LinearLoader,
    OrderDetailsModal,
    BillModal,
    BillsTable,
  },
  data() {
    return {
      billNumber: '',
      dateFrom: '',
      dateTo: '',
      clientList: [{ id: 0, full_name: 'Select Client' }],
      selectedClient: 0,
      orders: [],
      selectedOrder: null,
      showOrderDetails: false,
      showBillModal: false,
      settlementType: 0,
      totalItems: 0,
      itemsPerPage: 10,
      page: 1,
      loading: false,
    };
  },
  watch: {
    page() {
      this.$nextTick(() => {
        this.findBill();
      });
    },
  },
  computed: {
    ...mapGetters('sales', ['loading']),
    ...mapState('pos', ['paymentSettlements']),

    settlementOptions() {
      return [{ id: 0, name: 'All' }, ...this.paymentSettlements];
    },
    totalPaginationItems() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
  },
  methods: {
    ...mapActions('sales', ['getClients', 'filterOrders']),
    ...mapActions('pos', ['fetchsetpaymentSettlements']),

    exportToExcel() {
      if (this.loading) return;
      this.loading = true;
      const filters = {
        from: this.dateFrom,
        to: this.dateTo,
        client_id: this.selectedClient,
        bill_no: 'download',
        company_id: localStorage.getItem('smart_company_id'),
        settlement_type: this.settlementType,
        page: this.page,
      };
      this.filterOrders(filters)
        .then((ORDERS) => {
          const dataCleaned = ORDERS.data.orders.map((Order) => (
            {
              bill: Order.bill_no,
              date: Order.date,
              time: Order.time,
              table: Order.table,
              amount: Order.bill_sum,
              discount: Order.discount,
              amount_paid: Order.final_amount,
              settlement: Order.settlement,
              served_by: Order.waiter,
              client: Order.client_name || '',
              description: Order.discount_reason ? Order.discount_reason : Order.description,
            }));
          this.exportDataToExcel(dataCleaned, 'OrdersExport_smart_pos');
        })
        .catch((e) => {
          this.$eventBus.$emit('show-snackbar', e);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    async findBill() {
      if (this.loading) return;
      const filters = {
        from: this.dateFrom,
        to: this.dateTo,
        client_id: this.selectedClient,
        bill_no: this.billNumber.length > 0 ? this.billNumber : 0,
        company_id: localStorage.getItem('smart_company_id'),
        settlement_type: this.settlementType,
        page: this.page,
      };
      const Orders = await this.filterOrders(filters);
      this.orders = Orders.data.orders;
      this.totalItems = Orders.total_items;
    },

    showOrderItems(order) {
      this.selectedOrder = order;
      this.showOrderDetails = true;
    },

    showBill(order) {
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
  async created() {
    const Clients = await this.getClients('all');
    if (Clients.data) this.clientList = [{ id: 0, full_name: 'Select Client' }, ...Clients.data];
    await this.fetchsetpaymentSettlements();
  },
};
</script>
<style scoped lang="scss">
@import '../../../../styles/constants.scss';

    .find_bill {
      background-color: $white;
      font-family: $font-style;
      min-height: 100%;
      border-left: 0.5px solid $border-color;
      height: calc(100vh - 52px);

      .header_nav {
        height: 56px;
        width: 100%;
        padding: 5px;
        border-bottom: 0.5px solid $border-color;
        display: inline-flex;
      }

      .search_filter {
          height: 80px;
          width: 100%;
          padding: 5px;
          border-bottom: 0.5px solid $border-color;
          display: inline-flex;
          flex-direction: row;
          justify-content: center;

          > div {
              height: 100%;
              overflow: hidden;
              padding: 5px;
              width: 100%;
              justify-content: center;
              justify-self: center;
              align-items: center;
              // margin-top: 20px;

              .frm_input {
                  height: 30px;
              }
          }
      }

      .orders_table {
        overflow-y: auto;
        height: calc(100vh - 250px);
      }
    }
</style>
