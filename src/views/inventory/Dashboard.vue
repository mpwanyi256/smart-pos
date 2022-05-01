<template>
  <div class="inventory">
    <LoadingSpinner class="large" v-if="loading" />
    <div v-else class="inventory-items">
      <Table>
        <template slot="header">
          <th>
            <div class="download">
              <BaseTooltip
                @button="downloadCSV"
                message="Download csv" icon="download"
                color="green"
              />
              <BaseTextfield v-model="search" placeholder="Search" />
            </div>
          </th>
          <th>Pack Size</th>
          <th>Unit price</th>
          <th>Min Stock</th>
          <th>In Stock</th>
          <th>Stock Value</th>
        </template>
        <template slot="body">
            <tr v-for="(item, i) in inventoryFiltered" :key="i">
                <td>{{ item.item_name.toUpperCase() }}</td>
                <td>{{ item.pack_size }}</td>
                <td>{{ item.unit_price }}</td>
                <td>{{ item.minimum_stock }}</td>
                <td>{{ item.available_stock }} {{ item.unit_measure }}</td>
                <td> {{ item.available_stock_value }} </td>
            </tr>
        </template>
      </Table>
    </div>
    <Pagination @change="page = $event" :length="totalPaginationItems" />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Table from '@/components/generics/new/Table.vue';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import LoadingSpinner from '@/components/generics/LoadingSpinner.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import Pagination from '@/components/generics/new/Pagination.vue';
import DownloadCSVMixin from '@/mixins/DownloadCSVMixin';

export default {
  name: 'InventoryDashboard',
  mixins: [DownloadCSVMixin],

  components: {
    Table,
    LoadingSpinner,
    BaseTextfield,
    BaseTooltip,
    Pagination,
  },

  data() {
    return {
      inventory: [],
      loading: true,
      dateSelected: '',
      search: '',
      page: 1,
      itemsPerPage: 15,
      totalItems: 0,
    };
  },

  computed: {
    ...mapGetters('auth', ['user']),

    inventoryFiltered() {
      return this.inventory.length
        ? this.inventory.filter((Item) => Item.item_name.toLowerCase()
          .match(this.search.toLowerCase())) : [];
    },

    totalPaginationItems() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    dayOpen() {
      return this.user.company_info ? this.user.company_info.day_open : null;
    },
  },

  watch: {
    page() {
      this.$nextTick(() => {
        this.fetchInventory();
      });
    },
  },

  async created() {
    this.$nextTick(async () => {
      if (this.dayOpen) await this.fetchInventory();
    });
  },

  methods: {
    ...mapActions('inventory', ['updateItem']),

    async fetchInventory() {
      this.loading = true;
      this.updateItem({
        get_inventory_status: this.dayOpen,
        company_id: this.user.company_id,
        page: this.page,
      })
        .then((inv) => {
          this.inventory = inv.data;
          this.totalItems = inv.total_items;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },

    downloadCSV() {
      this.download(this.inventory, `Inventory As At ${this.dayOpen}`);
    },
  },

};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.download {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.inventory {
  background-color: $white;
  font-family: $font-style;
  height: calc(100vh - 52px);
  border-left: 0.5px solid $border-color;
  display: flex;
  flex-direction: column;

  .inventory-items {
    height: calc(100vh - 118px);
  }
}
</style>
