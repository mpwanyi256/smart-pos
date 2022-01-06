import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'CloudMixin',

  data() {
    return {
      orders: [],
      outlets: [],
      dateFrom: '',
      dateTo: '',
    };
  },
  computed: {
    ...mapGetters('auth', ['user', 'fbCompany']),

    company() {
      return this.user.company_info;
    },
  },
  eventBusCallbacks: {
    'sync-cloud': 'syncData',
  },

  methods: {
    ...mapActions('backups', ['fetchData', 'pushToCloud']),
    ...mapActions('settings', ['post']),
    ...mapActions('auth', ['getUserById']),

    async syncData() {
      console.log('Sync cloud');
      await this.getUserById();
      await this.getOutlets();
      await this.setSales();
    //   await this.getOrders();
    },

    async setSales() {
      const PAYLOAD = {
        data: [{
          key: `${this.fbCompany.id}${this.user.outlet_id}`,
          data: {
            day_open: this.company.day_open_display,
            days_left: this.company.days_left,
            total_sale: this.company.total_sale,
            company_ref: this.fbCompany.id,
            outlet_id: this.user.outlet_id,
            name: this.user.outlet_name,
            package: this.user.package,
          },
        }],
        collection: 'outlets',
      };
      await this.pushToCloud(PAYLOAD);
    },

    async getOutlets() {
      const OUTLETS = await this.post({ fetch_company_outlets: 'all' }).catch(() => null);
      if (OUTLETS) {
        const outlets = OUTLETS.data;
        const fbOutlets = [];
        outlets.forEach((outlet) => {
          fbOutlets.push({
            key: `${this.fbCompany.id}${outlet.id}`,
            data: { ...outlet, company_ref: this.company.company_email },
          });
        });
        const PAYLOAD = {};
        PAYLOAD.collection = 'Outlets';
        PAYLOAD.data = fbOutlets;
        await this.pushToCloud(PAYLOAD);
      }
    },

    async getOrders() {
      const DATA = await this.fetchData({
        get_orders: 'all',
        date_from: this.dateFrom,
        date_to: this.dateTo,
      }).catch(() => null);

      if (DATA) {
        this.orders = DATA.data;
        const PAYLOAD = {};
        PAYLOAD.collection = 'Orders';
        PAYLOAD.data = [];
        this.orders.forEach((order) => {
          PAYLOAD.data.push({
            key: `${order.company_id}${this.fbCompany.id}${this.company.company_tin}${order.order_id}${order.bill_no}${order.outlet_id}`,
            data: { ...order, company_ref: this.company.company_email },
          });
        });
        await this.pushToCloud(PAYLOAD);
        // console.log('Cloud payload', PAYLOAD);
      }
    },

  },
};
