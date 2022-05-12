<template>
    <div class="suppliers">
      <div class="suppliers-table">
        <Table>
          <template slot="header">
              <tr>
                  <th>
                    <div class="add_supplier_option">
                      <BaseTooltip
                        @button="newSupplier = true"
                        message="Add new supplier" icon="plus"
                      />
                      <BaseTextfield v-model="search" placeholder="Search..." />
                    </div>
                  </th>
                  <th>Contact</th>
                  <th>Email address</th>
                  <th>
                    Supply items
                  </th>
                  <th>&nbsp;</th>
              </tr>
          </template>
          <template slot="body">
          <LinearLoader v-if="loading" />
              <tr v-else
                v-for="supplier in suppliers" :key="supplier.id"
              >
                  <td>{{ supplier.name }}</td>
                  <td>{{ supplier.contact }}</td>
                  <td>{{ supplier.email }}</td>
                  <td>
                    <v-btn small raised @click="viewSupplierMappings(supplier)">
                      view
                    </v-btn>
                  </td>
                  <td>
                      <v-btn small icon @click="updateSupplierInfo(supplier)">
                          <v-icon>
                              mdi-pencil
                          </v-icon>
                      </v-btn>
                  </td>
              </tr>
          </template>
        </Table>
      </div>
      <Pagination @change="page = $event" :length="totalPaginationItems" />
      <UpdateSupplierInfo
        v-if="updateSupplier && selectedSupplier"
        :supplier="selectedSupplier"
        @close="updateSupplier = false"
        @reload="reloadData"
      />
      <CreateSupplierModal
        v-if="newSupplier"
        @close="newSupplier = false"
        @reload="reloadData"
      />
      <SupplierItemMapping
        v-if="selectedSupplier && viewMappings"
        :supplier="selectedSupplier"
        @close="viewMappings = false"
      />
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import Table from '@/components/generics/new/Table.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import LinearLoader from '@/components/generics/Loading.vue';
import UpdateSupplierInfo from '@/components/inventory/suppliers/UpdateSupplierInfo.vue';
import CreateSupplierModal from '@/components/inventory/suppliers/CreateSupplierModal.vue';
import SupplierItemMapping from '@/components/inventory/suppliers/SupplierItemMapping.vue';
import Pagination from '@/components/generics/new/Pagination.vue';

export default {
  name: 'Suppliers',
  components: {
    Table,
    BaseTextfield,
    LinearLoader,
    UpdateSupplierInfo,
    BaseTooltip,
    CreateSupplierModal,
    SupplierItemMapping,
    Pagination,
  },
  data() {
    return {
      suppliers: [],
      search: '',
      loading: false,
      updateSupplier: false,
      selectedSupplier: null,
      newSupplier: false,
      viewMappings: false,
      page: 1,
      totalItems: 0,
      itemsPerPage: 15,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),

    totalPaginationItems() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    companyId() {
      return this.user ? this.user.company_id : null;
    },
  },
  watch: {
    search(val) {
      if (val.length >= 3) {
        this.fetchSuppliers(val);
      } else {
        this.fetchSuppliers('all');
      }
    },
  },
  created() {
    this.fetchSuppliers();
  },
  methods: {
    ...mapActions('inventory', ['updateItem']),

    viewSupplierMappings(supplier) {
      this.selectedSupplier = supplier;
      this.viewMappings = true;
    },

    reloadData() {
      this.updateSupplier = false;
      this.newSupplier = false;
      this.fetchSuppliers();
    },

    updateSupplierInfo(supplier) {
      this.selectedSupplier = supplier;
      this.updateSupplier = true;
    },

    async fetchSuppliers(searchFilter) {
      this.loading = true;
      const Suppliers = await this.updateItem({
        get_suppliers: searchFilter || 'paginated',
        company_id: this.companyId,
        page: this.page,
      });
      if (!Suppliers.error) {
        this.suppliers = Suppliers.data;
        this.totalItems = Suppliers.total_items;
      }
      this.loading = false;
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

    .suppliers {
        height: calc(100vh - 52px);
        width: 100%;
        display: flex;
        flex-direction: column;
        overflow: auto;
        color: $black;

        .suppliers-table {
          height: calc(100vh - 114px);
        }
    }

    .add_supplier_option {
      width: 100%;
      display: flex;
      flex-direction: row;
      gap: 10px;
      justify-content: left;
      align-items: center;
    }

</style>
