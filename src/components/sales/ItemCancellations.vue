<template>
    <div class="find_bill">
        <div class="header_nav">
            <div>
                <h2>Item cancellations
                    <span><br>
                    <v-btn
                        v-if="totalItems > 1"
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
                <div class="bill_no">
                    <DatePickerBeta @picked="setDateFrom = $event" :message="'From'" />
                </div>
                <div class="bill_no">
                    <DatePickerBeta @picked="setDateTo = $event" :message="'To'" />
                </div>
                <div class="bill_no">
                    <v-btn small @click="fetchCancellations">Search</v-btn>
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
                      <th>Cancelled By</th>
                      <th>REASON</th>
                  </tr>
            </template>
            <template #body>
                <tr v-for="record in cancellations" :key="`cancelled-${record.id}`">
                    <td>{{ record.date }}</td>
                    <td>{{ record.item_name }}</td>
                    <td>{{ record.table_name }}</td>
                    <td>{{ record.bill_number }}</td>
                    <td>{{ record.cancelled_by }}</td>
                    <td>{{ record.reason }}</td>
                </tr>
            </template>
            </Table>
        </div>
        <Pagination @change="page = $event" :length="totalPaginationItems" />
    </div>
</template>
<script>
import DatePickerBeta from '@/components/generics/DatePickerBeta.vue';
import Table from '@/components/generics/new/Table.vue';
import Pagination from '@/components/generics/new/Pagination.vue';
import LoadingSpinner from '@/components/generics/LoadingSpinner.vue';
import ExcelExportMixin from '@/mixins/excelMixin';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'ItemCancellations',
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
      cancellations: [],
    };
  },
  watch: {
    page: {
      handler() {
        this.$nextTick(() => {
          this.fetchCancellations();
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
  methods: {
    ...mapActions('reports', ['getReport']),

    async fetchCancellations() {
      if (this.loading) return;
      const payload = {
        date_from: this.setDateFrom,
        date_to: this.setDateTo,
        page: this.page,
        get_cancelled_items: 'paginated',
      };
      const response = await this.getItemCancellations(payload);

      this.totalItems = response.total_items;
      this.cancellations = response.data;
    },

    async exportToExcel() {
      if (this.loading) return;
      const payload = {
        date_from: this.setDateFrom,
        date_to: this.setDateTo,
        page: this.page,
        get_cancelled_items: 'download',
      };
      const response = await this.getItemCancellations(payload);
      if (response) {
        // eslint-disable-next-line camelcase
        const cleanedData = response.data.map(({ order_id, ...otherFields }) => otherFields);
        this.exportDataToExcel(cleanedData, 'discounts_smart_pos');
      } else {
        this.$eventBus.$emit('show-snackbar', 'Sorry, export failed. Please try again');
      }
    },

    getItemCancellations(payload) {
      this.loading = true;
      return this.getReport(payload)
        .then((response) => response)
        .catch((e) => {
          console.error('error in getItemCancellations', e);
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
