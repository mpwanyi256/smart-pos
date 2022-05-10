<template>
    <div class="find_bill">
        <div class="header_nav">
            <div>
                <h2>NC items reports
                    <span v-if="totalItems > 1"><br>
                        <v-btn
                            small
                            @click="exportToExcel"
                            class="mt-2 ml-2 mb-2 green--text darken-4">
                            <v-icon left color="green darken-4">mdi-file-excel</v-icon>
                            {{ `Export ${totalItems} items to csv` }}
                        </v-btn>
                    </span>
                </h2>
            </div>
            <div class="search_filter">
                <div>
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
                    <DatePickerBeta @picked="setDateFrom = $event" :message="'From'" />
                </div>
                <div class="bill_no">
                    <DatePickerBeta @picked="setDateTo = $event" :message="'To'" />
                </div>
                <div class="bill_no">
                    <v-btn small @click="fetchNCs">Search</v-btn>
                </div>
            </div>
        </div>
        <div class="orders_table">
            <LoadingSpinner class="large" v-if="loading" />
            <Table v-else>
                <template #header>
                    <tr>
                        <th>DATE</th>
                        <th>Menu Item</th>
                        <th>Table</th>
                        <th>Bill No</th>
                        <th>Settled By</th>
                        <th>COMPANY</th>
                        <th>NOTES</th>
                    </tr>
                </template>
                <template #body>
                    <tr v-for="record in ncItems" :key="`nc-${record.settlement_id}`">
                        <td>{{ record.date }}</td>
                        <td>{{ `${record.quantity} ${record.item_name}` }}</td>
                        <td>{{ record.table_name }}</td>
                        <td>{{ record.bill_number }}</td>
                        <td>{{ record.settled_by }}</td>
                        <td>{{ record.company_name }}</td>
                        <td>{{ record.reason }}</td>
                    </tr>
                </template>
            </Table>
        </div>
        <Pagination @change="page = $event" :length="totalPaginationItems" />
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import DatePickerBeta from '@/components/generics/DatePickerBeta.vue';
import Table from '@/components/generics/new/Table.vue';
import Pagination from '@/components/generics/new/Pagination.vue';
import LoadingSpinner from '@/components/generics/LoadingSpinner.vue';
import ExcelExportMixin from '@/mixins/excelMixin';

export default {
  name: 'NCReports',
  mixins: [ExcelExportMixin],
  components: {
    DatePickerBeta,
    Table,
    Pagination,
    LoadingSpinner,
  },
  data() {
    return {
      setDateFrom: '',
      setDateTo: '',
      totalItems: 1,
      page: 1,
      itemsPerPage: 15,
      loading: false,
      ncItems: [],
      clientList: [{ id: 0, full_name: 'All Clients' }],
      selectedClient: 0,
    };
  },
  watch: {
    page: {
      handler() {
        this.$nextTick(() => {
          this.fetchNCs();
        });
      },
      immediate: true,
    },
  },
  computed: {
    ...mapGetters('auth', ['user']),
    totalPaginationItems() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
  },
  async created() {
    const Clients = await this.getClients('all');
    if (Clients.data) this.clientList = [{ id: 0, full_name: 'All Clients' }, ...Clients.data];
  },
  methods: {
    ...mapActions('reports', ['getReport']),
    ...mapActions('sales', ['getClients']),

    async fetchNCs() {
      if (this.loading) return;
      const payload = {
        date_from: this.setDateFrom,
        date_to: this.setDateTo,
        page: this.page,
        get_nc_reports: 'paginated',
        client_company_id: this.selectedClient,
      };
      const response = await this.getNCs(payload);

      this.totalItems = response.total_items;
      this.ncItems = response.data;
    },

    async exportToExcel() {
      if (this.loading) return;
      const payload = {
        date_from: this.setDateFrom,
        date_to: this.setDateTo,
        page: this.page,
        get_nc_reports: 'download',
        client_company_id: this.selectedClient,
      };
      const response = await this.getNCs(payload);
      if (response) {
        // eslint-disable-next-line camelcase
        const cleanedData = response.data.map(({ order_id, ...otherFields }) => otherFields);
        this.exportDataToExcel(cleanedData, 'discounts_smart_pos');
      } else {
        this.$eventBus.$emit('show-snackbar', 'Sorry, export failed. Please try again');
      }
    },

    getNCs(payload) {
      this.loading = true;
      return this.getReport(payload)
        .then((response) => response)
        .catch((e) => {
          console.error('error in getNCs', e);
          return null;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.find_bill {
    background-color: $white;
    font-family: $font-style;
    height: calc(100vh - 52px);
    border-left: 0.5px solid $border-color;
    display: flex;
    flex-direction: column;

    .header_nav {
        min-height: 56px;
        width: 100%;
        padding: 5px;
        border-bottom: 0.5px solid $border-color;
        display: grid;
        grid-template-columns: 40% 60%;
        justify-content: center;

        > div {
            display: inline-flex;
            align-items: center;
        }

        .search_filter {
            height: 100%;
            width: 100%;
            display: inline-flex;
            align-items: center;

            > div {
                height: 100%;
                overflow: hidden;
                padding: 5px;
                width: 100%;
                justify-content: center;
                justify-self: center;
                margin-top: 20px;

                .frm_input {
                    height: 30px;
                }
            }
        }

    }

    .orders_table {
        overflow-y: auto;
        height: calc(100vh - 200px);
    }
  }
</style>
