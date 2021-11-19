<template>
    <v-card class="kot_order">
        <div class="kot_head" :class="columnClass">
            <div>
            <BaseTooltip
              v-if="allowItemsCheckoout && department !== 0"
              @button="markAllItemsReady"
              message="Mark all items as ready"
              icon="thumb-up"
              color="green"
              :class="columnClass"
              :small="true"
              class="float-right"
            />
            {{ `T:${kot.table_name} #${kot.kot_id} (${kot.waiter})` }}
            </div>
            <div class="text-right">
                <!-- <BaseTooltip
                    v-if="allowItemsCheckoout && department !== 0"
                    @button="markAllItemsReady"
                    message="Mark all items as ready"
                    icon="thumb-up"
                    color="green"
                    :class="columnClass"
                    class="float-right"
                /> -->
            </div>
        </div>
        <div class="kots_list">
            <KotItem
                v-for="(item, i) in runnungOrders"
                :highlighted="i %2 == 0"
                :key="`kot-${item.id}`"
                :menuItem="item"
                :showPreparationTime="isReadyColumn"
                :columnClass="columnClass"
                @mark-as-served="markItemAsServed($event)"
            />
        </div>

        <ConfirmModal
            v-if="markItemServed && selectedKOT"
            :title="`${selectedKOT.name} is ready to serve?`"
            @close="markItemServed = false"
            @yes="performItemCheckout"
        />
        <ConfirmModal
            v-if="checkoutAllItems"
            :title="`Are you sure all items are ready?`"
            @close="checkoutAllItems = false"
            @yes="performAllItemsCheckout"
        />
    </v-card>
</template>
<script>
import { mapActions } from 'vuex';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import KotItem from '@/components/kds/kotItem.vue';
import ConfirmModal from '@/components/generics/ConfirmModal.vue';

export default {
  name: 'KOTOrder',
  props: {
    checkoutId: {
      type: Number,
      required: true,
    },
    kot: {
      type: Object,
      required: true,
    },
    column: {
      type: String,
      required: true,
    },
    columnClass: {
      type: String,
      required: true,
    },
    department: {
      type: [Number, String],
      required: true,
    },
  },
  components: {
    BaseTooltip,
    KotItem,
    ConfirmModal,
  },
  data() {
    return {
      selectedKOT: null,
      markItemServed: false,
      checkoutAllItems: false,
    };
  },
  computed: {
    isReadyColumn() {
      return this.column === 'Ready';
    },
    allowItemsCheckoout() {
      return !!['New orders', 'Running Late', 'Delayed'].includes(this.column);
    },
    headerColor() {
      let notColor;
      if (this.column === 'New orders') {
        notColor = 'just_in';
      } else if (this.column === 'Running Late') {
        notColor = 'delaying';
      } else if (this.column === 'Ready') {
        notColor = 'ready';
      } else {
        notColor = 'delayed';
      }

      return notColor;
    },

    runnungOrders() {
      const pendingServe = this.kot.items.filter((KOT) => KOT.status === 0);
      const readyToPickUp = this.kot.items.filter((KOT) => KOT.status === 1);
      return ['New orders', 'Running Late', 'Delayed'].includes(this.column) ? pendingServe : readyToPickUp;
    },
  },
  methods: {
    ...mapActions('kds', ['queryKds']),

    performAllItemsCheckout() {
      this.queryKds({
        checkout_all_items: this.kot.kot_id,
        time_in: this.kot.items[0].time,
        date: this.kot.date,
        checkout_status: this.checkoutId,
        department_selected: this.department,
      }).then((res) => {
        if (!res.error) {
          this.checkoutAllItems = false;
          this.$emit('reload');
        }
      }).catch((e) => {
        console.error('Error checking out item', e);
      });
    },

    markAllItemsReady() {
      this.checkoutAllItems = true;
    },

    markItemAsServed(kot) {
      if (!this.allowItemsCheckoout) return;
      this.selectedKOT = kot;
      this.markItemServed = true;
    },
    performItemCheckout() {
      // Add dynamic status in the api params
      this.queryKds({
        checkout_item: this.selectedKOT.id,
        time_in: this.selectedKOT.time,
        date: this.selectedKOT.date,
        checkout_status: this.checkoutId,
        department_selected: this.department,
      }).then((res) => {
        if (!res.error) {
          this.markItemServed = false;
          this.selectedKOT = false;
          this.$emit('reload');
        }
      }).catch((e) => {
        console.error('Error checking out item', e);
      });
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

.kot_order {
    height: auto;
    width: 100%;
    background-color: $white;
    color: $black;
    border: 0.5px solid $border-color;
    display: flex;
    flex-direction: column;
    gap: 15px;

    .kot_head {
        display: grid;
        grid-template-columns: 80% 20%;
        font-weight: bold;
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

        >div {
          width: 100%;
          display: flex;
          justify-content: left;
          align-items: center;
          padding-left: 10px;
          flex-direction: row;
          gap: 5px;
        }

        >div:last-child {
          display: flex;
          justify-content: center;
          align-items: center;
          // padding-right: 5px;
        }

    }

    .kots_list {
      height: 100%;
    }

    .just_in {
        background-color: $white;
        color: $blue;
    }

    .delaying {
        background-color: $white;
        color: $orange;
    }

    .delayed {
        background-color: $white;
        color: $red !important;
    }

    .ready {
        background-color: $bg_color !important;
        color: $green !important;
    }
}

.kot_order:hover {
  box-shadow: $elevation-mid;
}
</style>
