<template>
    <InfiniteScroll class="purchases_section" @refetch="fetchMore" :hasNext="hasNext">
      <template #content>
        <Table>
          <template slot="header">
            <tr>
              <th>
                <div class="purchases_filter">
                  <BaseTooltip
                    @button="createInvModal = true"
                    message="Create new purchase invoice" icon="plus"
                  />
                  <CustomDropdown
                    text="Select supplier"
                    :items="suppliers"
                    item-display-key="name"
                    @selected="selectedSupplier = $event"
                    :selected-item="selectedSupplier"
                  />
                </div>
              </th>
              <th>
                <BaseTextfield v-model="search" placeholder="Search" />
              </th>
              <th>Date</th>
              <th>Invoice amount</th>
              <th>Added by</th>
              <th>&nbsp;</th>
              <th>&nbsp;</th>
            </tr>
          </template>
          <template slot="body">
              <tr v-for="(invoice, i) in invoices" :key="i">
                  <td>{{ invoice.supplier.toUpperCase() }}</td>
                  <td>{{ invoice.inv_no }}</td>
                  <td>{{ invoice.date }}</td>
                  <td>{{ invoice.inv_amount_display }}</td>
                  <td>{{ invoice.added_by }}</td>
                  <td>
                    <v-btn icon @click="viewInvoiceItems(invoice)">
                      <v-icon>mdi-buffer</v-icon>
                    </v-btn>
                  </td>
                  <td>
                    <v-btn icon @click="deleteInvoice(invoice.id)">
                      <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                  </td>
              </tr>
          </template>
        </Table>
        <CreateNewInvoice
          v-if="createInvModal"
          @close="reloadInvoices"
        />
        <ConfirmModal
          v-if="confirmDelete && selectedInv"
          title="Are you sure you want to delete invoice?"
          @close="confirmDelete = false"
          @yes="dropInvoice"
        />
        <InvoiceItemsModal
          v-if="viewItems && selectedInv"
          :invoice="selectedInv"
          @close="viewItems = false"
        />
      </template>
    </InfiniteScroll>
</template>
<script>
import { mapActions } from 'vuex';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import Table from '@/components/generics/new/Table.vue';
import CreateNewInvoice from '@/components/inventory/Purchases/CreateNewInvoice.vue';
import ConfirmModal from '@/components/generics/ConfirmModal.vue';
import InvoiceItemsModal from '@/components/inventory/Purchases/InvoiceItemsModal.vue';
import InfiniteScroll from '@/components/generics/new/InfiniteScroll.vue';
import CustomDropdown from '@/components/generics/new/CustomDropdown.vue';

export default {
  name: 'PurchasesInvoices',
  components: {
    Table,
    BaseTooltip,
    BaseTextfield,
    CreateNewInvoice,
    ConfirmModal,
    InvoiceItemsModal,
    InfiniteScroll,
    CustomDropdown,
  },
  data() {
    return {
      search: '',
      createInvModal: false,
      invoices: [],
      invoiceItems: [],
      selectedInv: '',
      confirmDelete: false,
      viewItems: false,
      hasNext: false,
      page: 1,
      suppliers: [],
      totalSuppliers: 0,
      selectedSupplier: 0,
    };
  },
  async created() {
    await this.fetchInvoices();
    await this.fetchSuppliers();
  },
  watch: {
    search: {
      handler(val) {
        if (val.length >= 3 || val.length === 0) {
          this.page = 1;
          this.$nextTick(() => {
            this.fetchInvoices();
          });
        }
      },
      immediate: true,
    },
    selectedSupplier: {
      handler() {
        console.log(this.selectedSupplier);
        this.$nextTick(() => {
          this.fetchInvoices();
        });
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('inventory', ['updateItem']),

    dropInvoice() {
      this.updateItem({
        delete_invoice: this.selectedInv,
      }).then(async () => {
        this.confirmDelete = false;
        this.selectedInv = '';
        await this.fetchInvoices();
      }).catch((e) => {
        console.error(e);
      });
    },

    viewInvoiceItems(inv) {
      this.selectedInv = inv;
      this.viewItems = true;
    },

    deleteInvoice(inv) {
      this.selectedInv = inv;
      this.confirmDelete = true;
    },

    fetchMore() {
      this.page += 1;
      this.$nextTick(() => {
        this.fetchInvoices();
      });
    },

    async fetchInvoices() {
      const Invoices = await this.updateItem({
        fetch_invoices: 'all',
        page: this.page,
        search: this.search.trim(),
        supplier_id: this.selectedSupplier.id,
      });
      if (!Invoices.error) {
        const DATA = new Set(Array.from(Invoices.data));
        if ((this.search.length >= 3 || this.search.length === 0) && this.page === 1) {
          console.log('set new...');
          this.invoices = DATA;
        } else {
          console.log('append');
          this.invoices = [...this.invoices, ...DATA];
        }
        this.invoices = [...this.invoices, ...DATA];
        this.hasNext = Invoices.has_next;
      }
    },

    async fetchSuppliers() {
      this.loading = true;
      const Suppliers = await this.updateItem({
        get_suppliers: 'all',
        company_id: this.companyId,
        page: this.page,
      });
      if (!Suppliers.error) {
        this.suppliers = [{ name: 'All', id: 0 }, ...Suppliers.data];
        this.totalSuppliers = Suppliers.total_items;
      }
      this.loading = false;
    },

    async reloadInvoices() {
      this.createInvModal = false;
      await this.fetchInvoices();
    },

  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

    .purchases_section {
        height: calc(100vh - 52px);
        width: 100%;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        color: $black;
    }

    .purchases_filter {
        display: flex;
        flex-direction: row;
        gap: 10px;
        // justify-content: center;
        align-items: center;
    }
</style>
