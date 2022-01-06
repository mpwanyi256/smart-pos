<template>
  <PageTemplate title="Supplier statements">
    <template slot="title-actions">
      <BaseDropDownFab
        ref="BaseDropDownFab"
        v-if="statement.length"
        icon="cloud-download"
        title=""
        :options="downloadOptoins"
        color="#31a3dd"
        @selected="downloadHandler"
      />
    </template>
    <template slot="header-actions">
      <v-select dense outlined
        :items="suppliers"
        item-text="name"
        item-value="id"
        v-model="supplierId"
        label="Select Supplier"
      />
      <DatePickerBeta
        message="From"
        @picked="dateFrom = $event"
        :max="dateToday"
      />
      <DatePickerBeta
        message="To"
        @picked="dateTo = $event"
        :max="dateToday"
      />
      <v-btn :disabled="!supplierId" small class="mr-3" @click="fetchStatement">
        Search
      </v-btn>
    </template>
    <template slot="body">
      <LinearLoader v-if="loading" />
      <Table>
        <template slot="header">
            <tr>
              <th>Date</th>
              <th colspan="2">Description</th>
              <th>Debit (Payments)</th>
              <th>Credit (Purchases)</th>
              <th>Balance</th>
            </tr>
          </template>
          <template slot="body">
            <tr v-for="(entry, i) in statement" :key="`entry-${i}`">
              <td>{{ entry.date }}</td>
              <td colspan="2">{{ entry.title }}</td>
              <td>{{ entry.debit }}</td>
              <td>{{ entry.credit }}</td>
              <td>
                <strong>{{ entry.balance }}</strong>
              </td>
            </tr>
          </template>
      </Table>
    </template>
  </PageTemplate>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Table from '@/components/generics/new/Table.vue';
import PageTemplate from '@/views/estates/PageTemplate.vue';
import LinearLoader from '@/components/generics/Loading.vue';
import DatePickerBeta from '@/components/generics/DatePickerBeta.vue';
import BaseDropDownFab from '@/components/generics/new/BaseDropDownFab.vue';
import DownloadCSVMixin from '@/mixins/DownloadCSVMixin';
import ShowPDFMixin from '@/mixins/ShowPDFMixin';

export default {
  name: 'SupplierStatements',
  mixins: [DownloadCSVMixin, ShowPDFMixin],
  components: {
    PageTemplate,
    LinearLoader,
    DatePickerBeta,
    Table,
    BaseDropDownFab,
  },
  data() {
    return {
      loading: false,
      suppliers: [],
      dateFrom: '',
      dateTo: '',
      supplierId: '',
      statement: [],
      downloadOptoins: [
        { text: 'Excel' },
        { text: 'PDF' },
      ],
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),

    dateToday() {
      return new Date().toISOString();
    },

    selectedSupplier() {
      return this.suppliers.find((Supplier) => Supplier.id === this.supplierId);
    },
  },
  watch: {
    async supplierId() {
      await this.fetchStatement();
    },

    async dateFrom() {
      await this.fetchStatement();
    },

    async dateTo() {
      await this.fetchStatement();
    },
  },
  async created() {
    await this.fetchSuppliers();
  },
  methods: {
    ...mapActions('inventory', ['updateItem']),

    async fetchSuppliers(searchFilter) {
      this.loading = true;
      const Suppliers = await this.updateItem({
        get_suppliers: searchFilter || 'all',
      });
      if (!Suppliers.error) {
        this.suppliers = Suppliers.data;
      }
      this.loading = false;
    },

    async fetchStatement() {
      if (!this.supplierId) return;
      const STATEMENT = await this.updateItem({
        supplier_statement: this.supplierId,
        date_from: this.dateFrom,
        date_to: this.dateTo,
      });
      if (STATEMENT.data) {
        this.statement = STATEMENT.data;
      }
    },

    downloadHandler(option) {
      if (option.text === 'Excel') {
        const STATEMENT = this.statement.map((Item) => ({
          Date: Item.date,
          Description: Item.title,
          'Debit (Purchases)': Item.debit,
          'Credit (Payments)': Item.credit,
          Balance: Item.balance,
        }));
        this.download((STATEMENT), `${this.selectedSupplier.name} statement between ${this.dateFrom} and ${this.dateTo}`);
      } else {
        const PATH = `SupplierStatement.php?statement=${this.supplierId},${this.dateFrom},${this.dateTo},${this.user.company_id}`;
        this.openPDF(PATH);
      }
    },

  },
};
</script>
