<template>
    <div class="find_bill">
        <div class="header_nav">
            <h3 class="mt-2">Items sold</h3>
            <v-spacer></v-spacer>
            <v-btn
              v-if="totalItems > 1"
              small
              @click="exportToExcel"
              class="mt-2 ml-2 mb-2 green--text darken-4">
              <v-icon left color="green darken-4">mdi-file-excel</v-icon>
              {{ `Export ${totalItems} items to csv` }}
          </v-btn>
        </div>
        <div class="search_filter">
            <div class="bill_no">
                <v-select
                    outlined
                    label="Department"
                    v-model="departmentSelected" dense
                    item-text="name"
                    item-value="id"
                    :items="departments"
                />
            </div>
            <div class="bill_no">
                <v-select
                    outlined
                    label="Select item"
                    v-model="menuItemSelected" dense
                    item-text="name"
                    item-value="id"
                    :items="departmentSelected == 0 ? menuItems : menuItemsFiltered"
                />
            </div>
            <div class="bill_no">
                <DatePickerBeta @picked="setDateFrom" :message="'From'" />
            </div>
            <div class="bill_no">
                <DatePickerBeta @picked="setDateTo" :message="'To'" />
            </div>
            <div class="bill_no">
                <v-btn small @click="fetchSales">Search</v-btn>
            </div>
        </div>
        <div class="orders_table">
          <LinearLoader v-if="loading" />
          <Table>
            <template slot="header">
              <tr>
                <th>Item name</th>
                <th>Unit Price</th>
                <th>Quantity sold</th>
                <th>Amount</th>
                <!-- <th>CASH</th>
                <th>VISA</th>
                <th>Mo. Money</th>
                <th>NC</th>
                <th>CANCELLED</th> -->
              </tr>
            </template>
            <template slot="body">
              <tr v-for="item in itemsSoldFetch" :key="`item-sold-${item.item_id}`">
                <td>{{ item.item_name }}</td>
                <td>{{ item.item_price }}</td>
                <td>{{ item.quantity_sold }}</td>
                <td>{{ item.amount_sold }}</td>
                <!-- <td>{{ item.cash }}</td>
                <td>{{ item.visa }}</td>
                <td>{{ item.mobile }}</td>
                <td>{{ item.nc }}</td>
                <td>{{ item.cancelled }}</td> -->
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
import LinearLoader from '@/components/generics/Loading.vue';
import Table from '@/components/generics/new/Table.vue';
import ExcelExportMixin from '@/mixins/excelMixin';
import Pagination from '@/components/generics/new/Pagination.vue';

export default {
  name: 'ItemsSold',
  mixins: [ExcelExportMixin],
  components: {
    DatePickerBeta,
    LinearLoader,
    Table,
    Pagination,
  },
  data() {
    return {
      menuItems: [{ id: 0, name: 'All items' }],
      menuItemSelected: 0,
      departments: [
        { id: 0, name: 'ALL' },
      ],
      departmentSelected: 0,
      dateFrom: '',
      dateTo: '',
      itemsSoldFetch: [],
      page: 1,
      totalItems: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    ...mapGetters('sales', ['loading']),
    menuItemsFiltered() {
      return this.menuItems.filter((Item) => Item.display === this.departmentSelected);
    },

    totalPaginationItems() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
  },
  watch: {
    async departmentSelected(val) {
      if (val !== 0) await this.fetchSales();
    },
    page() {
      this.fetchSales();
    },
  },
  methods: {
    ...mapActions('sales', ['getMenuItems', 'getDepartments', 'fetchItemsSold']),

    exportToExcel() {
      const filters = {
        department: 'download',
        menu_item: this.menuItemSelected,
        date_from: this.dateFrom,
        date_to: this.dateTo,
        page: this.page,
        itemsPerPage: this.itemsPerPage,
        company_id: localStorage.getItem('smart_company_id'),
      };
      this.fetchItemsSold(filters)
        .then((response) => {
          this.exportDataToExcel(response.data, 'items_sold_smart_pos');
        })
        .catch((e) => {
          console.log('Error in exportToExcel', e);
        });
    },

    async fetchSales() {
      if (this.loading) return;
      const filters = {
        department: this.departmentSelected,
        menu_item: this.menuItemSelected,
        date_from: this.dateFrom,
        date_to: this.dateTo,
        page: this.page,
        itemsPerPage: this.itemsPerPage,
        company_id: localStorage.getItem('smart_company_id'),
      };
      this.fetchItemsSold(filters)
        .then((ItemsSold) => {
          if (!ItemsSold.error) {
            this.totalItems = ItemsSold.total_items;
            this.itemsSoldFetch = ItemsSold.data.map((Sale) => ({
              item_id: Sale.item_id,
              item_name: Sale.item_name.toUpperCase(),
              item_price: Sale.item_price,
              quantity_sold: Sale.quantity_sold,
              amount_sold: Sale.amount_sold,
              // cancelled: Sale.settlement[0].amount,
              // cash: Sale.settlement[1].amount,
              // cheque: Sale.settlement[2].amount,
              // company: Sale.settlement[3].amount,
              // eft: Sale.settlement[4].amount,
              // mobile: Sale.settlement[5].amount,
              // nc: Sale.settlement[6].amount,
              // split: Sale.settlement[8].amount,
              // visa: Sale.settlement[9].amount,
            }));
          }
        });
    },

    async fetchMenuItems() {
      const filters = { item_id: this.menuItemSelected };
      const menuItems = await this.getMenuItems(filters);
      if (!menuItems.error) this.menuItems = [{ id: 0, name: 'All Items' }, ...menuItems.data];
    },

    async fetchMenuDepartments() {
      const departments = await this.getDepartments();
      if (!departments.error) {
        this.departments = [
          { id: 0, name: 'ALL' },
          ...departments.data,
        ];
      }
    },

    setDateFrom(dateSelected) {
      this.dateFrom = dateSelected;
    },

    setDateTo(dateSelected) {
      this.dateTo = dateSelected;
    },
  },
  async mounted() {
    await this.fetchMenuDepartments();
    await this.fetchMenuItems();
  },
};
</script>
<style scoped lang="scss">
@import '../../../../styles/constants.scss';

    .find_bill {
        background-color: $white;
        font-family: $font-style;
        min-height: 100%;
        border-left: 0.5px solid $border-color;

        .header_nav {
            height: 56px;
            width: 100%;
            padding: 5px;
            border-bottom: 0.5px solid $border-color;
            display: inline-flex;
        }

        .search_filter {
            height: 100px;
            width: 100%;
            padding: 5px;
            border-bottom: 0.5px solid $border-color;
            display: inline-flex;
            flex-direction: row;
            justify-content: center;

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

        .orders_table {
          height: calc(100vh - 310px);
          overflow: auto;
        }
    }
</style>
