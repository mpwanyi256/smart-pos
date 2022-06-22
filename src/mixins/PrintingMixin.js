import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'PrintMixin',
  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('menu', ['departments']),

    actualDepartments() {
      return this.departments.filter((dept) => dept.id > 0);
    },
  },
  eventBusCallbacks: {
    'print-cancellation-kot': 'printCancelledKotItem',
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
          } else {
            this.$eventBus.$emit('show-snackbar', 'Please Check Bill Printer');
          }
        })
        .catch(() => {
          this.errorMessage = 'Error printing bill';
          this.$eventBus.$emit('show-snackbar', 'Please Check Bill Printer');
        });
    },

    printCancelledKotItem(cancelledItem) {
      // eslint-disable-next-line camelcase
      const { cancel_id, reason } = cancelledItem;
      // eslint-disable-next-line camelcase
      const { waiter, table, bill_no } = this.order;

      const params = {
        print_cancelled_kot: cancel_id,
        reason,
        cancelled_by: this.user.user_name,
        company_name: this.company.company_name,
        location: this.company.company_location,
        tin: this.company.company_tin,
        contact_number: this.company.company_mobile,
        waiter,
        table,
        bill_number: bill_no,
      };
      this.sendKotJob(params)
        .catch(() => {
          this.errorMessage = 'Check bar printer';
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

      this.actualDepartments.forEach(async (dept) => {
        await this.sendKotJob({ ...params, department_id: dept.id })
          .catch(() => {
            this.$eventBus.$emit('show-snackbar', `Please check ${dept.name} printer.`);
          });
      });

      // await this.printBarKot(params);
      // await this.printKitchen(params);
      // await this.printOtherKot(params);
      await this.confirmOrder();
    },

    printOtherKot(params) {
      this.sendKotJob({ ...params, department_id: 4 })
        .catch(() => {
          this.errorMessage = 'Check printer';
        });
    },

    printBarKot(params) {
      this.sendKotJob({ ...params, department_id: 1 })
        .catch(() => {
          this.errorMessage = 'Check bar printer';
        });
    },

    printKitchen(params) {
      this.sendKotJob({ ...params, department_id: 2 })
        .catch(() => {
          this.errorMessage = 'Check kitchen printer';
        });
    },
  },
};
