<template>
    <div class="sections">
      <v-expansion-panels>
        <v-expansion-panel
          v-for="(section,i) in sections"
          :key="i"
        >
          <v-expansion-panel-header
            :class="section.has_orders ? 'has-orders' : ''">
            <div>
              <span v-if="section.has_orders">
                {{ ordersCount(section) }}
              </span>
              {{ section.name }}
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content
          class="expansion_panel">
            <div class="tables_display">
              <TableComponent
                v-for="table in activeTables(section)"
                :key="`postable${table.id}`"
                :table="table"
                @order="confirmOrderCreation(table)"
                :ref="`table-${table.id}`"
              />
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <ConfirmModal
        v-if="dialog && tableSelected"
        :title="`Create new order for ${tableSelected.name}`"
        @close="cancelCreate"
        @yes="createOrder"
      />
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import TableComponent from '@/components/pos/order/TableComponent.vue';
import ConfirmModal from '@/components/generics/ConfirmModal.vue';
import TimezoneMixin from '@/mixins/TimezoneMixin';

export default {
  name: 'SectionsPane',

  mixins: [
    TimezoneMixin,
  ],

  components: {
    TableComponent,
    ConfirmModal,
  },

  props: {
    sections: {
      type: Array,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    dayOpen: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      tableSelected: null,
      dialog: false,
    };
  },

  methods: {
    ...mapActions('pos', ['setRunningOrderId', 'setRunningOrder', 'checkTableStatus']),

    cancelCreate() {
      this.tableSelected = null;
      this.dialog = false;
    },

    activeTables(section) {
      return section.tables.filter((Table) => Table.hidden === false);
    },

    ordersCount(section) {
      return section.tables.filter((Table) => Table.order.id !== null).length;
    },

    async setOrder(orderId) {
      await this.$eventBus.$emit('fetch-orders');
      this.setRunningOrderId(orderId);
    },

    confirmOrderCreation(table) {
      this.checkTableStatus(table.id)
        .then((response) => {
          if (!response.error) {
            this.setOrder(response.order_id);
          } else {
            this.tableSelected = table;
            this.dialog = true;
          }
          console.log('Status', response);
        })
        .catch((e) => {
          console.log('Error fetching table status', e);
        });
    },

    async createOrder() {
      if (!this.user) return;
      const filters = {
        table_id: this.tableSelected.id,
      };
      this.$eventBus.$emit('create-table-order', filters);
      this.dialog = false;
      this.tableSelected = null;
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.sections {
  display: flex;
  margin: 5px;
  color: $black;
  font-size: 14px;
}

  ::v-deep .v-expansion-panel-content__wrap {
    padding: 0px;
  }

.has-orders {
  background-color: $header !important;
  font-weight: bold;
  font-size: 12px;
  border-bottom: 1px solid $border-color;

  span {
    color: $accent-color;
    margin-right: 5px;
    font-size: 14px;
  }
}

.tables_display {
  max-height: 210px;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  padding: 10px;
  margin-bottom: 10px;

  // Desktop view
  @media screen and (max-width: 1440px) {
    grid-template-columns: 100%;
  }

  @media screen and (min-width: 1441px) {
    grid-template-columns: 50% 50%;
  }

}

</style>
