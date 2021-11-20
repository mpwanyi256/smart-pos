<template>
    <div
      class="order_item"
      :class="isPending ? 'pending' : ''"
    >
        <div class="item_name_display">
          <p>
            <span><strong>({{ orderItem.quantity }})</strong></span>
            {{ `${orderItem.name}` }}
            <br>
              <span class="item_amount">
                {{ orderItem.amount }}
              </span>
          </p>
        </div>
        <div class="update_options">
            <div class="input_field">
                <template v-if="addNote && isPending">
                    <input type="text" v-model="itemNotes"
                    class="search_field" placeholder="Add note" />
                    <v-btn small @click="saveNote">Save</v-btn>
                </template>
                <template v-else>
                    <small
                      v-if="orderItem.notes"
                      @click="addNote = !addNote"
                      class="notes"
                      :class="isPending ? 'pending' : ''"
                    >
                      <span>
                        Notes:
                      </span>
                      {{ orderItem.notes }}
                    </small>
                </template>
                <!-- <div class="add_ons">
                  <v-chip class="addon"
                    :class="isPending ? 'white' : ''"
                    :close="isPending"
                    @click:close="dropAddon"
                  >
                    Addon item name
                  </v-chip>
                </div> -->
            </div>
            <div class="options">
              <template v-if="isPending">
                <BaseTooltip
                  v-if="
                    companyType == 2
                    || managerCanDeleteItem
                    || waiterCanDeleteItem
                    || cashierCanDeleteItem
                  "
                  @button="$emit('delete', orderItem.id)"
                  message="Delete item"
                  icon="delete-outline"
                />
                <BaseTooltip
                  @button="addNote = !addNote"
                  message="Add notes"
                  icon="note-outline"
                />
                <!-- TO DO :: implement addons -->
                <BaseTooltip
                  @button="showAddons = true"
                  message="Add addons"
                  icon="blur"
                />
              </template>
              <template v-else>
                <BaseTooltip
                  v-if="companyType == 2 || managerCanCancelItem
                  || cashierCanCancelItem || waiterCanCancelItem"
                  @button="cancelOrderItem = true"
                  color="blue"
                  message="Cancel item"
                  icon="delete"
                />
                <BaseTooltip
                  v-if="companyType == 1 && (managerCanShiftItem || cashierCanShiftItem)"
                  @button="shiftItem = true"
                  color="blue"
                  message="Shift item"
                  icon="arrow-expand"
                />
                <BaseTooltip
                  v-if="orderItem.addons_count > 0"
                  @button="showAddonItemsList = true"
                  color="blue"
                  :message="`View ${orderItem.addons_count} addons`"
                  icon="blur"
                />
                <!-- TO DO :: Check if user is alllowed to perform this action -->
              </template>
            </div>
            <ConfirmModal
              v-if="cancelOrderItem"
              :requireReason="true"
              title="Please enter cancellation reason"
              @close="cancelOrderItem = false"
              @yes="cancelOrder"
            />
            <ShiftOrderItem
              v-if="shiftItem"
              @close="shiftItem = false"
              @shift="shiftOrderItemHandler"
            />
            <MenuItemAddons
              v-if="showAddons"
              :order-item="orderItem"
              @close="showAddons = false"
            />
            <MenuitemAddonsDisplay
              v-if="showAddonItemsList"
              :order-item="orderItem"
              @close="showAddonItemsList = false"
            />
        </div>
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import ConfirmModal from '@/components/generics/ConfirmModal.vue';
import ShiftOrderItem from '@/components/pos/order/manage/ShiftOrderItem.vue';
import MenuItemAddons from '@/components/pos/order/manage/MenuItemAddons.vue';
import MenuitemAddonsDisplay from '@/components/pos/order/manage/MenuitemAddonsDisplay.vue';

import TimezoneMixin from '@/mixins/TimezoneMixin';
import ControlsMixin from '@/mixins/ControlsMixin';

export default {
  name: 'OrderItemPreview',
  mixins: [TimezoneMixin, ControlsMixin],
  props: {
    orderItem: {
      type: Object,
      required: true,
    },
  },
  components: {
    BaseTooltip,
    ConfirmModal,
    ShiftOrderItem,
    MenuItemAddons,
    MenuitemAddonsDisplay,
  },
  data() {
    return {
      addNote: false,
      itemNotes: '',
      confirmAction: false,
      cancelOrderItem: false,
      shiftItem: false,
      showAddons: false,
      showAddonItemsList: false,
    };
  },
  computed: {
    isPending() {
      return this.orderItem.status === '0';
    },
  },
  created() {
    this.itemNotes = this.orderItem.notes;
  },
  methods: {
    ...mapActions('pos', ['updateRunningOrder', 'updateOrder']),

    async shiftOrderItemHandler(table) {
      const tableOrder = {
        create_new_order: this.user.company_id,
        user_id: this.user.id,
        date: this.dayOpen,
        time: this.time,
        table_id: table.id,
        outlet_id: this.user.outlet_id,
      };
      const shiftInfo = {
        table_order_id: table.order.id,
        shift_order_item_id: this.orderItem.id,
        notes: `Item shifted from ${table.name.toUpperCase()} by ${this.user.user_name}`,
      };

      const tableHadOrder = table.order.id;
      if (tableHadOrder) {
        await this.shiftItemToTable(shiftInfo);
      } else {
        const createNewOrder = await this.updateOrder(tableOrder);
        if (!createNewOrder.error) {
          const newShiftInfo = {
            table_order_id: createNewOrder.order_id,
            shift_order_item_id: this.orderItem.id,
            notes: `Item shifted from ${table.name.toUpperCase()} by ${this.user.user_name}`,
          };
          await this.shiftItemToTable(newShiftInfo);
        }
      }
      this.shiftItem = false;
    },

    async shiftItemToTable(filters) {
      const shiftItem = await this.updateOrder(filters);
      if (!shiftItem.error) this.$eventBus.$emit('reload-order');
    },

    cancelOrder(reason) {
      const cancel = {
        ...this.orderItem,
        reason,
      };
      this.$emit('cancel', cancel);
      this.cancelOrderItem = false;
    },

    saveNote() {
      const filter = {
        add_item_note: this.itemNotes,
        item_id: this.orderItem.id,
      };
      this.$emit('note', filter);
      this.addNote = false;
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

    .pending {
      background-color: $header !important;
    }

    .add_ons {
      width: 100%;
      display: flex;
      flex-direction: row;
      gap: 5px;
      overflow-x: auto;
      overflow-y: hidden;

      .addon {
        width: auto;
      }
    }

    .order_item {
        min-height: 130px;
        background-color: $white;
        border: 1px solid $border-color;
        border-radius: 5px;
        box-shadow: $elevation-low;
        padding: 10px;
        display: flex;
        flex-direction: column;

        ::-webkit-scrollbar{
          width: 5px;
          height: 5px;
        }

        .item_name_display {
          display: flex;
          width: 100%;
          justify-content: left;
          color: $black;

          p {
              color: $black;
              font-size: 16px;
              width: 100%;
              text-transform: capitalize;

              span {
                font-weight: bold;
                color: $black;
              }
              .item_amount {
                color: $accent-color;
                font-weight: bold;
                text-align: right;
              }
          }
        }

        .update_options {
            display: grid;
            grid-template-columns: 80% 20%;

            .input_field {
                display: flex;
                flex-direction: row;
                gap: 5px;
                align-items: center;

                .notes {
                    color: $black;
                    background-color: $border-color;
                    padding: 0px 5px 0px 5px;
                    border-radius: 5px;
                    text-transform: uppercase;
                    cursor: pointer;
                }

                .search_field {
                    height: 35px;
                    border: 1px solid $white;
                    background-color: $white;
                    border-radius: 5px;
                    margin-right: 10px;
                    direction: ltr;
                    padding-left: 5px;
                    padding-right: 5px;
                    box-shadow: $elevation-default;
                }
            }

            .options {
                display: flex;
                flex-direction: row;
                direction: rtl;
                gap: 10px;
            }
        }
    }
</style>
