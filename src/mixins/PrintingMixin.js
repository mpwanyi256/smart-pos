import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'PrintMixin',
  computed: {
    ...mapGetters('auth', ['user']),
  },
  methods: {
    ...mapActions('print', ['sendPrintJob', 'sendKotJob']),

    async performBillPrint() {
      const bill = {
        print_bill: this.order.order_id,
        printed_by: this.user.user_name,
        company_name: this.company.company_name,
        location: this.company.company_location,
        tin: this.company.company_tin,
        contact_number: this.company.company_mobile,
        waiter: this.order.waiter,
        exceptions_category_id: this.user.exception_category_id || 0,
        receipt_message: this.company.company_receipt,
        show_vat_calcular: this.showVatCalcular ? 1 : 0,
        add_vat_to_bill: this.allowAddVAT ? 1 : 0,
      };
      this.sendPrintJob(bill)
        .then((res) => {
          if (res.printed) {
            this.printBill();
          }
        })
        .catch(() => {
          this.errorMessage = 'Error printing bill';
        });
    },

    async performKotPrint() {
      const params = {
        print_kot: this.order.order_id,
        printed_by: this.user.user_name,
        company_name: this.company.company_name,
        location: this.company.company_location,
        tin: this.company.company_tin,
        contact_number: this.company.company_mobile,
        waiter: this.order.waiter,
        exceptions_category_id: this.user.exception_category_id || 0,
        receipt_message: this.company.company_receipt,
        run_kot_print_job: true,
      };

      // Refactor :: Fetch all comp. Departments
      // Then send print operations to all

      await this.printBarKot(params);
      await this.printKitchen(params);
      await this.printOtherKot(params);
      await this.confirmOrder();
    },

    async printOtherKot(params) {
      this.sendKotJob({ ...params, department_id: 4 })
        .catch(() => {
          this.errorMessage = 'Check bar printer';
        });
    },

    async printBarKot(params) {
      this.sendKotJob({ ...params, department_id: 1 })
        .catch(() => {
          this.errorMessage = 'Check bar printer';
        });
    },

    async printKitchen(params) {
      this.sendKotJob({ ...params, department_id: 2 })
        .catch(() => {
          this.errorMessage = 'Check kitchen printer';
        });
    },
  },
};
