<template>
    <div class="orders_pane">
            <template v-if="loading">
                <div v-for="column in displayRows" :key="`column-${column.name}`">
                    <div class="column_header" :class="displayColorCode(column.name)">
                        <h1>{{ column.name }}</h1>
                    </div>
                    <LoadingKds />
                </div>
            </template>
            <template v-else>
                <div v-for="column in displayRows" :key="`column-${column.name}`">
                    <div class="column_header" :class="displayColorCode(column.name)">
                        <h1>{{ column.name }}</h1>
                    </div>
                    <div class="kot_list">
                        <template v-for="kot in columnKots(column.name)">
                            <KOTOrder
                                v-if="columnKots(column.name).length > 0"
                                :key="kot.id"
                                :kot="kot"
                                :column="column.name"
                                :checkoutId="column.checkout_id"
                                :department="selectedDepartment"
                                :columnClass="displayColorCode(column.name)"
                                @reload="$emit('reload')"
                            />
                        </template>
                    </div>
                </div>
            </template>
        </div>
</template>
<script>
import KOTOrder from '@/components/kds/KOTOrder.vue';
import LoadingKds from '@/components/kds/LoadingKds.vue';

export default {
  name: 'OrdersDisplayScreen',

  components: {
    KOTOrder,
    LoadingKds,
  },

  props: {
    selectedDepartment: {
      type: [Number, String],
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    displayRows: {
      type: Array,
      required: true,
    },
    runningOrders: {
      type: Array,
      required: true,
      default: () => [],
    },
  },

  methods: {
    columnKots(column) {
      if (!this.runningOrders.length) return [];
      let kots = [];
      if (column === 'New orders') {
        kots = this.runningOrders.filter((Order) => (Order.delay_time < 10)
        && this.hasPendingItems(Order.items));
      } else if (column === 'Running Late') {
        kots = this.runningOrders.filter((Order) => (Order.delay_time > 10)
        && (Order.delay_time <= 15) && this.hasPendingItems(Order.items));
      } else if (column === 'Pick up') {
        kots = this.runningOrders.filter((Order) => Order.has_ready_orders);
      } else if (column === 'Delayed') {
        kots = this.runningOrders.filter((Order) => (Order.delay_time > 15)
        && this.hasPendingItems(Order.items));
      }
      return kots;
    },

    hasPendingItems(kotItems) {
      return !!kotItems.filter((Order) => Order.status === 0).length;
    },

    displayColorCode(column) {
      let notColor;
      if (column === 'New orders') {
        notColor = 'just_in';
      } else if (column === 'Running Late') {
        notColor = 'delaying';
      } else if (column === 'Pick up') {
        notColor = 'ready';
      } else {
        notColor = 'delayed';
      }

      return notColor;
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

    .orders_pane {
        overflow-x: hidden;
        overflow-y: auto;
        top: 0;
        bottom: 0;
        height: calc(100vh - 104px);
        display: flex;
        flex-direction: row;
        background-color: $bg_color;
        flex-wrap: nowrap;
        padding: 8px 12px;
        gap: 16px;

        > div {
            width: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background-color: $gray-95;
            box-shadow: 0px 1px 14px rgb(11 13 14 / 10%), 0px 0px 1px rgb(11 13 14 / 10%);
            border-radius: 4px;
            padding: 4px 4px;
            -webkit-tap-highlight-color: transparent;

            .kot_list {
                display: flex;
                flex-direction: column;
                height: calc(100vh - 156px);
                overflow-x: hidden;
                overflow-y: auto;
                gap: 10px;
                padding-top: 5px;
            }

            .column_header {
              height: 52px !important;
              display: inline-flex;
              justify-content: left;
              align-items: center;
              color: $kds-text-header-color;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-style: normal;
              font-size: 14px;
              line-height: 150%;
              letter-spacing: -0.005em;
              border-bottom: 1px solid $bg_color;
              padding-left: 16px;
            }
        }
    }
</style>
