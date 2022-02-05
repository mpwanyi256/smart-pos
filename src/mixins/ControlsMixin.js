import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'ControlsMixin',

  data() {
    return {
      allowManagerShiftCODE: 'ALMSIFTB',
      allowCashierShiftCODE: 'ALCSIFTB',
      allowCashierCancelCODE: 'ENCASCANITEMS',
      allowManagerCancelCODE: 'AMCBIN',
      allowWaiterCancelCODE: 'ALLWAITCANCEL',
      allowWaiterDeleteCODE: 'AWDIBS',
      allowManagerDeleteCODE: 'AMDIBS',
      allowManagerViewSales: 'AAVSR',
      allowManagerCreateNewOrder: 'AMMODZ',
    };
  },

  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('settings', ['controls']),

    userRole() {
      return this.user ? this.user.role : 0;
    },

    isSuperUser() {
      return this.userRole === 5;
    },

    isManager() {
      return this.userRole === 1;
    },

    companyType() {
      return this.user ? this.user.company_info.business_type : 0;
    },

    dayOpen() {
      return this.user ? this.user.company_info.day_open : null;
    },

    managerCanCreateNewOrders() {
      const setting = this.getSetting(this.allowManagerCreateNewOrder);
      return setting ? this.isManager && setting.status : false;
    },

    canCreateNewOrder() {
      return this.managerCanCreateNewOrders || [2, 3, 5].includes(this.userRole);
    },

    allowAddVAT() {
      const setting = this.getSetting('ENVAT');
      return setting ? setting.status : false;
    },

    showVatCalcular() {
      const setting = this.getSetting('SVATCALC');
      return setting ? setting.status : false;
    },

    managerCanViewSales() {
      const setting = this.getSetting(this.allowManagerViewSales);
      return (this.userRole === 1 && setting.status) || this.isSuperUser;
    },

    managerCanShiftItem() {
      const setting = this.getSetting(this.allowManagerShiftCODE);
      return (this.userRole === 1 && setting.status) || this.isSuperUser;
    },

    cashierCanShiftItem() {
      const setting = this.getSetting(this.allowCashierShiftCODE);
      return (this.userRole === 2 && setting.status) || this.isSuperUser;
    },

    managerCanCancelItem() {
      const mc = this.getSetting(this.allowManagerCancelCODE);
      return (this.userRole === 1 && mc.status) || this.isSuperUser;
    },

    cashierCanCancelItem() {
      const setting = this.getSetting(this.allowCashierCancelCODE);
      return (this.userRole === 2 && setting.status) || this.isSuperUser;
    },

    waiterCanCancelItem() {
      const allWait = this.getSetting(this.allowWaiterCancelCODE);
      return (this.userRole === 3 && allWait.status) || this.isSuperUser;
    },

    waiterCanDeleteItem() {
      const allWait = this.getSetting('AWDIBS');
      return (this.userRole === 3 && allWait.status) || this.isSuperUser;
    },

    managerCanDeleteItem() {
      const allWait = this.getSetting(this.allowManagerDeleteCODE);
      return (this.userRole === 1 && allWait.status);
    },

    cashierCanDeleteItem() {
      const allWait = this.getSetting('ACDIBS');
      return (this.userRole === 2 && allWait.status);
    },

    waiterCanPrintBill() {
      const allWait = this.getSetting('WAIPRBILL');
      return (this.userRole === 3 && allWait.status);
    },

    userCanPrintBill() {
      return this.waiterCanPrintBill || [1, 2, 5].includes(this.userRole);
    },

    cashierCanDiscount() {
      const allWait = this.getSetting('ALCADTB');
      return (this.userRole === 2 && allWait.status);
    },

    managerCanDiscount() {
      const allWait = this.getSetting('ALMADTB');
      return (this.userRole === 1 && allWait.status);
    },

    userCanDiscount() {
      return this.cashierCanDiscount || this.managerCanDiscount;
    },

    allowAddWaiter() {
      let allow;
      if ([1, 2, 5].includes(this.userRole)) {
        allow = true;
      } else {
        allow = false;
      }
      return allow;
    },

    allowSettleBill() {
      let allow;
      if ([1, 2, 5].includes(this.userRole)) {
        allow = true;
      } else {
        allow = false;
      }
      return allow;
    },
  },

  async created() {
    await this.getAccessControls();
  },

  methods: {
    ...mapActions('settings', ['fetch', 'post']),

    async getAccessControls() {
      const OUTLET = localStorage.getItem('smart_outlet_id');
      await this.fetch({ get_access_controls: 'all', outlet: OUTLET });
    },

    getSetting(CODE) {
      return this.controls.find((Control) => Control.set_code === CODE);
    },
  },
};
