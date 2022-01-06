<template>
    <Basemodal
        :title="`Sales report ${selectedDate}`"
        :size="1200" @close="$emit('close')"
        :fullscreen="true"
        >
        <template slot="action" v-if="managerCanViewSales">
          <div ref="salesReport" class="report-actions">
            <BaseTooltip
              class="pdf"
              @button="sendReportOnEmail"
              :disabled="sendingEmail"
              :loading="sendingEmail"
              color="blue"
              message="Send Email"
              icon="email"
            />
            <BaseTooltip
              class="pdf"
              @button="printReport"
              color="red"
              message="Print report"
              icon="file-pdf"
            />
            <DatePickerBeta
              message="Select date"
              @picked="selectedDate = $event"
            />
          </div>
        </template>
          <div v-if="!loading && managerCanViewSales" ref="salesReport" class="sales_report">
            <!-- <LinearLoader v-if="loading" /> -->
              <h3>Sales</h3>
              <PaymentSettlements
                :data="report.payments"
              />
              <h3>Other settlements</h3>
              <PaymentSettlements
                :data="report.other_payments"
              />
              <h3>Departmentwise Sales</h3>
              <PaymentSettlements
                :data="report.department_settlements"
              />
              <DepartmentSale
                v-for="(dep, i) in report.department_item_sales"
                :key="i"
                :info="dep"
              />
              <!-- <OrdersList
                :orders="report.orders"
              /> -->
          </div>
          <div v-else class="loading_section">
            <LoadingSpinner v-if="loading" class="large" />
            <template v-else>
              <v-btn icon x-large>
                <v-icon class="red--text">mdi-alert</v-icon>
              </v-btn>
              <h3>Sorry, you are not allowed to view this section</h3>
            </template>
          </div>
    </Basemodal>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import Basemodal from '@/components/generics/Basemodal.vue';
import PaymentSettlements from '@/components/Reports/generics/PaymentSettlements.vue';
import DepartmentSale from '@/components/Reports/generics/DepartmentSales.vue';
// import OrdersList from '@/components/Reports/OrdersList.vue';
import DatePickerBeta from '@/components/generics/DatePickerBeta.vue';
import LoadingSpinner from '@/components/generics/LoadingSpinner.vue';
import ControlsMixin from '@/mixins/ControlsMixin';
import EmailMixin from '@/mixins/EmailMixin';

export default {
  name: 'SalesReport',
  mixins: [ControlsMixin, EmailMixin],
  props: {
    date: {
      type: String,
      required: true,
    },
  },
  components: {
    Basemodal,
    PaymentSettlements,
    DepartmentSale,
    DatePickerBeta,
    LoadingSpinner,
    // LinearLoader,
    BaseTooltip,
    // OrdersList,
  },
  data() {
    return {
      selectedDate: null,
      report: {},
      loading: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),

    companyInfo() {
      return this.user.company_info;
    },

    serverIP() {
      const IPAddress = localStorage.getItem('smartpos_ipaddress_set');
      return IPAddress || 'http://localhost:80/';
    },

    reportURL() {
      return `${this.serverIP}papi/pdf/salesReport.php?report=${this.selectedDate},${this.user.company_id}`;
    },
  },
  watch: {
    async selectedDate(val) {
      this.loading = true;
      if (val) await this.fetchReport();
    },
  },

  methods: {
    ...mapActions('reports', ['getReport', 'getPdf']),

    async sendReportOnEmail() {
      await this.sendReportViaEmail('SALES REPORT');
    },

    printPdf() {
      const route = {
        path: 'pdf/salesReport.php/',
        query: {
          company_name: this.companyInfo.company_name,
          location: this.companyInfo.company_location,
          tin: this.companyInfo.company_tin,
          user_name: this.user.user_name,
          date: this.selectedDate,
          print_sales: true,
        },
      };
      this.getPdf(route)
        .then((response) => {
          console.log('Sales pdf', response);
        }).catch((e) => {
          console.log('Sales pdf', e);
        });
    },

    printReport() {
      window.open(this.reportURL, '_blank').focus();
      // this.$emit('close');
    },

    fetchReport() {
      this.loading = true;
      this.getReport({
        get_daily_report: this.selectedDate,
        company_id: this.companyInfo.company_id,
      }).then((res) => {
        if (!res.error) this.report = res.data;
        this.loading = false;
      }).catch((e) => {
        console.log('Error', e);
        this.loading = false;
      });
    },
  },
  async created() {
    this.$nextTick(() => {
      this.selectedDate = this.date;
    });
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

  .report-actions {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  .loading_section {
    min-height: calc(100vh - 52px);
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .sales_report {
    min-height: 100%;
    background-color: $white;
    overflow: auto;
    background-color: $body-bg;
    font-family: $font-style;
    scroll-behavior: smooth;

    h3 {
      margin: 10px;
    }
  }
</style>
