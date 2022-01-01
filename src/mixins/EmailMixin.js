import { mapActions } from 'vuex';

export default {
  name: 'EmailMixin',
  data() {
    return {
      sendingEmail: false,
      errorMessage: '',
    };
  },
  methods: {
    ...mapActions('mail', ['sendEmail']),
    ...mapActions('pdf', ['generatePdf']),

    async sendReportViaEmail(message) {
      this.$eventBus.$emit('show-snackbar', 'Sending email...');
      this.sendingEmail = true;
      const dayOpen = localStorage.getItem('smart_company_day_open');
      const reportDate = message === 'END OF DAY SALES REPORT' ? dayOpen : this.selectedDate;
      const params = {
        report_date: reportDate,
        save_sales_report: reportDate,
      };
      const res = await this.generatePdf(params).catch(() => {
        this.$eventBus.$emit('show-snackbar', 'Error generating pdf');
        return null;
      });
      if (res && !res.error) {
        const emailParams = {
          send_sales_report: res.report_date,
          report_date: res.report_date,
          message,
        };
        const sendReportToEmail = await this.sendEmail(emailParams).catch(() => null);
        if (!sendReportToEmail) this.$eventBus.$emit('show-snackbar', 'Sorry, email was not sent. Please check your internet connection');
        if (message === 'END OF DAY SALES REPORT') {
          this.$emit('switch', this.selectedDate);
          this.$eventBus.$emit('show-snackbar', 'Day was closed.');
        } else {
          this.$eventBus.$emit('show-snackbar', 'Success! Email was sent.');
        }
      } else {
        if (message === 'END OF DAY SALES REPORT') this.$emit('switch', this.selectedDate);
        this.errorMessage = res.message;
      }
      this.sendingEmail = false;
    },

    sendClientBookingConfirmation(booking) {
      this.sendingEmail = true;
      this.sendEmail({
        send_booking_confirmation: 1,
        ...booking,
      }).then(() => {
        this.sendingEmail = false;
      }).catch((e) => {
        console.error('error', e);
        this.sendingEmail = false;
      });
    },
  },
};
