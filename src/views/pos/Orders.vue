<template>
    <div class="orders">
        <div
          class="day_open"
          v-show="dayOpen"
        >
          <v-btn text
            v-if="timeNow"
            :disabled="!canViewActions"
            @click="openActionsModal"
            class="time_display"
            :class="daysLeft < 10 ? 'days_warning' : ''"
          >
          <v-icon
            :class="daysLeft < 10 ? 'days_warning' : ''"
            class="time_display" left>
            mdi-calendar
          </v-icon>
          {{ `${daysLeft} Days ${timeNow}` }}
          </v-btn>
        </div>
        <div class="order_list">
            <SectionsPane
              v-if="companyType == 1"
              :sections="activeSections"
              :user="user"
              :dayOpen="dayOpen"
            />
            <div v-else
              class="order_pane">
                <div
                  v-for="order in pendingOrders"
                  :key="order.order_id"
                  :class="order.order_id == runningOrderId ? 'active' : ''"
                  @click="setOrder(order)"
                  :ref="`order-${order.order_id}`"
                >
                    <h3>#{{ order.bill_no }}</h3>
                    <small>
                        {{ `${order.waiter} @ ${order.time}` }}
                    </small>
                    <small>Amount: {{ order.bill_sum_display }}</small>
                </div>
            </div>
        </div>
        <ManagerActions
          v-if="actions"
          @close="actions = false"
          @action="actionHandler"
        />
        <SalesReport
          v-if="viewSales"
          @close="viewSales = false"
          :date="dayOpen"
        />
        <SwitchDayModal
          v-if="switchDay"
          @close="switchDay = false"
          @switch="closeDay"
          :message="errorMessage"
          :loading="loading"
        />
        <LicenseModal
          v-if="openLicenseModal"
          @close="openLicenseModal = false"
        />
        <SyncDataModal
          v-if="syncData"
          @close="syncData = false"
        />
    </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import SectionsPane from '@/components/pos/order/SectionsPane.vue';
import ManagerActions from '@/components/pos/manage/ManagerActions.vue';
import SalesReport from '@/components/Reports/SalesReport.vue';
import SwitchDayModal from '@/components/pos/manage/SwitchDayModal.vue';
import LicenseModal from '@/components/pos/manage/LicenseModal.vue';
import SyncDataModal from '@/components/cloud/SyncDataModal.vue';
import TimezoneMixin from '@/mixins/TimezoneMixin';

export default {
  name: 'Orders',
  mixins: [TimezoneMixin],
  components: {
    SectionsPane,
    ManagerActions,
    SalesReport,
    SwitchDayModal,
    LicenseModal,
    SyncDataModal,
  },

  data() {
    return {
      sections: [],
      actions: false,
      viewSales: false,
      timeNow: '',
      switchDay: false,
      errorMessage: '',
      loading: true,
      openLicenseModal: false,
      persistLicense: false,
      syncData: false,
    };
  },

  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('pos', ['runningOrderId', 'orders']),

    outletId() {
      return this.user.outlet_id;
    },

    companyId() {
      return this.user ? this.user.company_id : 0;
    },

    serverIP() {
      const IPAddress = localStorage.getItem('smartpos_ipaddress_set');
      return IPAddress ? `http://${IPAddress}/smartAdmin/` : 'http://localhost:80/smartAdmin/';
    },

    daysLeft() {
      return (this.user && this.user.company_info) ? this.user.company_info.days_left : '';
    },

    userName() {
      return (this.user && this.user.company_info) ? this.user.user_name : '';
    },

    userRole() {
      return (this.user && this.user.company_info) ? this.user.role : 0;
    },

    canViewActions() {
      return !![1, 5].includes(this.userRole);
    },

    activeSections() {
      return this.sections.filter((Section) => Section.hidden === false);
    },

    companyType() {
      return (this.user && this.user.company_info) ? this.user.company_info.business_type : 0;
    },

    pendingOrders() {
      return this.orders.filter((Order) => Order.status === 0);
    },

    dayOpen() {
      return this.user && this.user.company_info ? this.user.company_info.day_open : null;
    },

    dayOpenDisplay() {
      return this.user ? this.user.company_info.day_open_display : '';
    },
  },

  watch: {
    daysLeft(val) {
      if (val && val <= 0) {
        // notify client
        this.persistLicense = true;
        this.openLicenseModal = true;
      }
    },
    async dayOpen() {
      await this.$eventBus.$emit('fetch-orders');
    },
    async user() {
      if (this.user) {
        await this.fetchOrders();
        await this.fetchTables();
      }
    },
  },

  async created() {
    if (!this.user) return;
    await this.fetchOrders();
    await this.fetchTables();
    this.loading = false;

    setInterval(() => {
      const timeKati = new Date().getTime();
      const extract = new Date(timeKati);
      this.timeNow = `${extract.getHours()}:${this.padZero(extract.getMinutes())}:${this.padZero(extract.getSeconds())}`;
    }, 1000);
  },

  eventBusCallbacks: {
    'fetch-orders': 'fetchOrders',
    'reload-order': 'reload',
  },

  methods: {
    ...mapActions('pos', ['filterOrders', 'setRunningOrder', 'setRunningOrderId', 'updateOrder']),
    ...mapActions('auth', ['getUserById']),
    ...mapActions('reports', ['getReport']),
    ...mapActions('email', ['sendEmail']),

    openActionsModal() {
      if (!this.canViewActions) {
        this.$eventBus.$emit('show-snackbar',
          'Sorry, Restricted access to manager and super user!');
        return;
      }
      this.actions = true;
    },

    closeLicenseModal() {
      this.openLicenseModal = false;
    },

    padZero(Val) {
      return Val > 9 ? Val : `0${Val}`;
    },

    actionHandler(action) {
      switch (action) {
        case 'sales':
          if ([1, 5].includes(this.userRole)) this.viewSales = true;
          break;
        case 'open':
          this.switchDay = true;
          break;
        case 'email':
          this.sendSalesReport();
          break;
        case 'license':
          this.actions = false;
          this.openLicenseModal = true;
          break;
        case 'cloud':
          this.syncData = true;
          break;
        default:
          console.log('Invalid action');
          this.actions = true;
          return;
      }
      this.actions = false;
    },

    async closeDay(datePicked) {
      this.loading = true;
      this.getReport({
        close_day: this.dayOpen,
        open_day: datePicked,
      }).then((res) => {
        this.$eventBus.$emit('show-snackbar', res.message);
        this.errorMessage = '';
        this.getUserById();
        this.loading = false;
      })
        .catch(() => this.$eventBus.$emit('show-snackbar', 'Error in fetching sales report'))
        .finally(() => {
          this.switchDay = false;
        });
    },

    async fetchTables() {
      const Sections = await this.updateOrder(
        {
          get_setup_sections: this.companyId,
          day_open: this.dayOpen,
        },
      );
      if (!Sections.error) this.sections = Sections.data;
    },

    async reload() {
      await this.fetchOrders();
      this.$eventBus.$emit('fetch-items');
    },

    async fetchOrders() {
      await this.fetchTables();
      const orders = await this.filterOrders({
        bill_no: 0,
        from: this.dayOpen,
        to: this.dayOpen,
        client_id: 0,
        status: 1,
        outlet_id: this.outletId,
      });
      if (!orders.error) this.setRunning(orders.data.orders);
    },

    setRunning(orders) {
      if (!this.runningOrderId) return;
      const findRunning = orders.find((Order) => Order.order_id === this.runningOrderId);
      if (findRunning) this.setRunningOrder(findRunning);
    },

    setOrder(order) {
      this.setRunningOrder(order);
      this.setRunningOrderId(order.order_id);
      this.$eventBus.$emit('fetch-orders');
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

    .orders {
        width: 100%;
        height: calc(100vh - 52px);
        display: flex;
        flex-direction: column;

        .time_display {
          color: $accent-color;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .days_warning {
          color: $red !important;
        }

        .day_open {
          height: 50px;
          background-color: $white;
          color: $accent-color;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          overflow: hidden;
        }

        .order_list {
            max-height: calc(100vh - 102px);
            overflow-x: hidden;
            overflow-y: auto;
            width: 100%;

            .order_pane {
                display: flex;
                flex-direction: column;
                gap: 3px;
                padding: 10px;

                >div {
                    height: 58px;
                    width: 100%;
                    overflow: hidden;
                    background-color: $white;
                    color: $black;
                    display: flex;
                    flex-direction: column;
                    justify-content: left;
                    align-items: left;
                    cursor: pointer;
                    padding-left: 5px;
                    box-shadow: $elevation-low;
                    border-radius: 5px;
                }

                >div:focus {
                    font-weight: bold;
                }

                .active {
                  background-color: $blue;
                  color: $white;
                }
            }
        }

    }
</style>
