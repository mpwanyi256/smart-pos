<template>
    <div class="kds">
        <NavBar />
        <div class="toggle_display">
            <div>
              <h1 v-if="dayOpenDisplay">{{ `Display Screen ${dayOpenDisplay}`}}</h1>
              <BaseAlert
                v-if="errorMessage"
                :message="errorMessage"
                type="error"
              />

              <audio
                controls
                src="@/audio/mordernBell.wav"
                ref="audioPlayer"
                :autoplay="false"
                class="aidio-player"
              >
                Your browser does not support the
                <code>audio</code> element.
              </audio>
            </div>
            <div>
                <div>
                  <v-select
                    outlined dense
                    label="Display type"
                    :items="columns"
                    item-text="name"
                    item-value="id"
                    v-model="selectedDisplayColumn"
                  />
                  <v-select
                    outlined dense
                    label="Department"
                    :items="departments"
                    item-text="name"
                    item-value="id"
                    v-model="selectedDepartment"
                  />
                </div>
                <!-- <div>
                  <v-btn fab @click="fetchRunningOrders(true)">
                    <v-icon>mdi-refresh</v-icon>
                  </v-btn>
                </div> -->
            </div>
        </div>
        <OrdersDisplayScreen
          :loading="loading"
          :display-rows="selectedDisplayColumn == 0 ?displayRows : pickUpColumns"
          :runningOrders="runningOrders"
          :selected-department="selectedDepartment"
          @reload="fetchRunningOrders"
         />
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';
import NavBar from '@/components/nav/Navbar.vue';
import BaseAlert from '@/components/generics/new/BaseAlert.vue';
import OrdersDisplayScreen from '@/components/kds/OrdersDisplayScreen.vue';

export default {
  name: 'KDS',
  components: {
    NavBar,
    BaseAlert,
    OrdersDisplayScreen,
  },
  data() {
    return {
      runningOrders: [],
      selectedDepartment: 0,
      selectedDisplayColumn: 0,
      columns: [
        {
          name: 'Pending',
          id: 0,
        },
        {
          name: 'Ready',
          id: 1,
        },
      ],
      pickUpColumns: [
        {
          name: 'Pick up', min: 8, max: 1000000, checkout_id: 1,
        },
        {
          name: 'Getting Delayed', min: 8, max: 1000000, checkout_id: 1,
        },
        {
          name: 'Delayed Pick up', min: 8, max: 1000000, checkout_id: 1,
        },
      ],
      displayRows: [
        {
          name: 'New orders', min: 0, max: 5, checkout_id: 1,
        },
        {
          name: 'Running Late', min: 5, max: 8, checkout_id: 1,
        },
        {
          name: 'Delayed', min: 8, max: 1000000, checkout_id: 1,
        },
        // {
        //   name: 'Ready', min: 8, max: 1000000, checkout_id: 2,
        // },
      ],
      loading: true,
      polling: null,
      errorMessage: '',
      fetchingKDS: false,
      fetchingKOTS: true,
      BellNotificationSound: null,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('menu', ['departments']),

    routeName() {
      return this.$route.name;
    },

    dayOpen() {
      return this.user && this.user.company_info ? this.user.company_info.day_open
        : moment(new Date()).format('YY-MM-DD');
    },

    dayOpenDisplay() {
      return this.user && this.user.company_info ? this.user.company_info.day_open_display
        : moment(new Date()).format('YY-MM-DD');
    },
  },
  watch: {
    async selectedDisplayColumn() {
      this.fetchRunningOrders(true);
    },
    async selectedDepartment() {
      this.fetchRunningOrders(true);
    },
    routeName(val) {
      if (val !== 'kds') clearInterval(this.polling);
    },
    runningOrders: {
      handler(newlyLoaded, Prev) {
        const newItems = newlyLoaded && newlyLoaded.length ? newlyLoaded.map((i) => i.items) : 0;
        const prevItems = Prev && Prev.length ? Prev.map((i) => i.items) : 0;

        if (newItems !== 0 && prevItems !== 0) {
          if (newItems.length > prevItems.length) {
            this.$eventBus.$emit('show-snackbar', 'New order!...');
            this.playNotificationSound();
          }
        }
      },
      deep: true,
    },
  },
  beforeDestroy() {
    clearInterval(this.polling);
    this.polling = null;
  },
  async created() {
    this.BellNotificationSound = new Audio('@/audio/bell.mp3');
    await this.fetchRunningOrders(true);
    await this.getDepartments(0);
    this.loading = false;
    this.polling = setInterval(async () => {
      await this.fetchRunningOrders();
    }, 10000);
  },
  methods: {
    ...mapActions('kds', ['queryKds']),
    ...mapActions('menu', ['getDepartments']),

    playNotificationSound() {
      try {
        this.$refs.audioPlayer.play();
      } catch (e) {
        console.log('Audio player failed', e);
      }
    },

    displayColorCode(column) {
      let notColor;
      if (column === 'New orders') {
        notColor = 'just_in';
      } else if (column === 'Running Late') {
        notColor = 'delaying';
      } else if (column === 'Ready') {
        notColor = 'ready';
      } else {
        notColor = 'delayed';
      }

      return notColor;
    },

    hasPendingItems(kotItems) {
      return !!kotItems.filter((Order) => Order.status === 0).length;
    },

    async fetchRunningOrders(showLoader = false) {
      if (this.fetchingKDS) return;
      if (!this.dayOpen || this.fetchingKDS) return;
      if (showLoader) this.loading = true;
      this.fetchingKDS = true;
      this.queryKds({
        get_pending_kots: this.dayOpen,
        department_id: this.selectedDepartment,
        kds_type: this.selectedDisplayColumn,
        company_id: this.user.company_id,
      }).then((KOTS) => {
        this.runningOrders = KOTS.data;
        this.errorMessage = KOTS.error_message;
      }).catch(() => {
        this.errorMessage = 'Error fetching kds';
        return { data: [] };
      }).finally(() => {
        this.loading = false;
        this.fetchingKDS = false;
      });
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

.aidio-player {
  display: none;
}

.kds {
    width: 100%;
    height: 100vh;
    margin: 0;
    background-color: $bg_color;
    display: flex;
    flex-direction: column;
    font-family: $font-style !important;
    overflow: hidden;

    ::-webkit-scrollbar{
      width: 5px;
      height: 5px;
    }

    ::-webkit-scrollbar-thumb {
      background: $scrollbar-color;
      border-radius: 1ex;
      -webkit-border-radius: 1ex;
    }

    ::-webkit-scrollbar-corner {
      background: #000;
    }

    .orders_pane {
      overflow-x: hidden;
      overflow-y: auto;
      top: 0;
      bottom: 0;
      height: calc(100vh - 104px);
      display: flex;
      flex-direction: row;
      background-color: $bg_color;
      flex-wrap: nowrap;
      padding: 8px 12px;
      gap: 16px;

      > div {
          width: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background-color: $gray-95;
          box-shadow: 0px 1px 14px rgb(11 13 14 / 10%), 0px 0px 1px rgb(11 13 14 / 10%);
          border-radius: 4px;
          padding: 4px 4px;
          -webkit-tap-highlight-color: transparent;

          .kot_list {
              display: flex;
              flex-direction: column;
              height: calc(100vh - 156px);
              overflow-x: hidden;
              overflow-y: auto;
              gap: 10px;
              padding-top: 5px;
          }

          .column_header {
            height: 52px !important;
            display: inline-flex;
            justify-content: left;
            align-items: center;
            color: $kds-text-header-color;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-style: normal;
            font-size: 14px;
            line-height: 150%;
            letter-spacing: -0.005em;
            border-bottom: 1px solid $bg_color;
            padding-left: 16px;
          }
      }
    }

    .toggle_display {
      height: 52px;
      background-color: $white;
      display: grid;
      grid-template-columns: 50% 50%;
      justify-content: left;
      align-items: center;

      > div :first-child {
        padding-left: 10px;
        color: $black;
        display: flex;
        align-items: center;
        font-size: 18px;
      }

      > div:last-child {
          padding-right: 10px;
          text-align: right;

          > div {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            gap: 5px;
            max-width: 350px;
            margin-top: 5px;
            margin-right: 5px;
          }
      }
    }
}
</style>
