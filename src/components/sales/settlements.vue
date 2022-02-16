<template>
    <div class="sales-div">
      <template v-if="loading">
        <div class="loading_data">
          <LoadingSpinner class="large" />
        </div>
      </template>
      <template v-else>
        <div class="section-title ma-2">
            <h3>Settlements</h3>
        </div>
        <div class="sales-overview">
            <div class="settled-orders"
              v-for="payment in settlements"
              :key="payment.settlement_id"
            >
              <div class="display">
                <h1>{{ payment.amount }}</h1>
                <span>{{ payment.settlement_name }}</span>
              </div>
            </div>
        </div>
        <div class="section-title ma-2">
            <h3>Departmentwise sales</h3>
        </div>
        <div class="sales-overview">
            <div class="settled-orders" v-for="(payment, i) in departmentSales" :key="i">
                <div class="display">
                    <h1>{{ payment.amount }}</h1>
                    <span>{{ payment.name }}</span>
                    <i class="red--text darken-3" v-if="payment.name == 'OPEN DISH'">
                      <small>Is included in other departments</small>
                    </i>
                </div>
            </div>
        </div>
        <div class="running_orders">
          <RunningOrders class="panel-item" @vieworder="viewBill" />
          <!-- <CreditorsList class="panel-item" @vieworder="viewBill" /> -->
        </div>
        <BillModal
          v-if="showBill"
          :order="selectedOrder"
          @close="showBill = false"
        />
      </template>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import BillModal from '@/components/sales/modals/Bill.vue';
// import CreditorsList from '@/components/sales/Creditors.vue';
import RunningOrders from '@/components/sales/RunningOrders.vue';
import LoadingSpinner from '@/components/generics/LoadingSpinner.vue';

export default {
  name: 'Settlements',
  components: {
    BillModal,
    // CreditorsList,
    RunningOrders,
    LoadingSpinner,
  },
  data() {
    return {
      showOrderDetails: false,
      showBill: false,
      showCancelItemModal: false,
      selectedOrder: null,
      itemToCancel: null,
      loading: true,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('sales', ['sale']),
    company() {
      return this.user ? this.user.company_info : null;
    },
    settlements() {
      return this.sale.settlements ? this.sale.settlements : [];
    },
    departmentSales() {
      return this.sale.departments_settlement ? this.sale.departments_settlement : [];
    },
  },
  created() {
    this.$nextTick(async () => {
      this.loading = true;
      await this.getOrders();
      this.loading = false;
    });
  },
  methods: {
    ...mapActions('sales', ['CancelOrderItem', 'getOrders']),

    async cancelItemOnOrder(data) {
      await this.CancelOrderItem(data);
      this.showCancelItemModal = false;
      this.$refs.orderdetails.fetchOrderItems();
    },

    cancelOrderItem(item) {
      this.itemToCancel = item;
      this.showCancelItemModal = true;
    },

    viewOrderDetails(order) {
      this.showOrderDetails = true;
      this.selectedOrder = order;
    },
    viewBill(order) {
      this.selectedOrder = order;
      this.showBill = true;
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

.sales-div {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
    height: calc(100vh - 52px);;
    overflow-y: auto;

    .loading_data {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .running_orders {
      height: calc(100vh - 272px);
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: auto;
      padding-right: 15px;
    }

    .sales-overview {
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: 1px;
        overflow-y: hidden;
        margin: 5px;

        .settled-orders, .running-orders {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 56px;
            width: 100%;
            color: black;
            border-right: 0.5px solid #e2e2e2;
            background-color: white;
            // font-family: $font-style;
            padding: 10px;
            cursor: pointer;

            h1 {
                font-size: 16px !important;
                font-weight: bold;
            }

            .display {
                display: flex;
                flex-direction: column;
                text-align: center;
                cursor: pointer;
            }
        }
    }

    .sales-sammary {
        height: 250px;
        width: 100%;
        display: grid;
        grid-template-columns: 100% 100%;
        margin: 5px;

        >div {
            background-color: white;
        }

        >div:first-child {
            margin-right: 2px;
        }

        >div:last-child {
            margin-left: 2px;
        }

        .sales-outline {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            overflow-y: hidden;
            overflow-x: auto;

            .sale {
                display: grid;
                grid-template-columns: 50% 25% 25%;
                text-align: left;
                width: 100%;
                height: 36px;
                border: 0.3px solid #d6d6d6;
                justify-content: center;
            }
        }
    }

    .all-orders {
        width: 100%;
        background-color: white;
        min-height: 200px;
        overflow-y: auto;
        margin: 5px;
        overflow-y: auto;
    }

    .pending {
        min-height: 150px;
        border: 1px solid $light-grey;
        padding-top: 5px;

        .header {
            background-color: $dark-grey;
            padding: 10px;
            color: $white;
            text-align: left;
            font-weight: bold;
        }
    }

}
</style>
