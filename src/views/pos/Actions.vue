<template>
    <div class="actions_pane">
      <v-alert
        v-if="errorMessage"
        outlined dense
        type="info"
        class="white--text">
        {{ errorMessage }}
      </v-alert>
      <template
          v-for="(action, i) in actions">
        <div :key="`action-${i}`" class="action_item"
          @click="listen(action.name)"
          v-if="isAllowedAction(action.name)"
        >
          <v-icon class="icon">{{ action.icon }}</v-icon>
          <p class="name">{{ action.name }}
          </p>
        </div>
      </template>
    </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import ControlsMixin from '@/mixins/ControlsMixin';
import PrintMixin from '@/mixins/PrintingMixin';

export default {
  name: 'Actions',
  mixins: [ControlsMixin, PrintMixin],
  data() {
    return {
      actions: [
        { name: 'Confirm', icon: 'mdi-thumb-up-outline', allow: true },
        { name: 'Bill', icon: 'mdi-note-outline', allow: this.waiterCanPrintBill },
        { name: 'Settle', icon: 'mdi-credit-card-outline', allow: true },
        { name: 'Discount', icon: 'mdi-sale', allow: true },
        { name: 'VAT', icon: 'mdi-bookmark-minus-outline', allow: this.allowAddVAT },
      ],
      errorMessage: '',
    };
  },
  computed: {
    ...mapGetters('pos', ['runningOrder', 'runningOrderId']),
    ...mapGetters('auth', ['user']),

    userRole() {
      return this.user.role;
    },

    userCanDiscount() {
      return [1, 2, 5].includes(this.userRole);
    },

    allowAddWaiter() {
      return true;
    },

    company() {
      return this.user ? this.user.company_info : null;
    },

    order() {
      return this.runningOrder;
    },

    hasWaiter() {
      return this.order ? !!this.order.waiter : false;
    },

    companyType() {
      return this.user.company_info ? this.user.company_info.business_type : 0;
    },

    orderId() {
      return this.runningOrder ? this.runningOrder.order_id : null;
    },
  },
  watch: {
    errorMessage(val) {
      if (!val) return;
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    },

    companyType() {
      this.addWaiterAction();
    },
  },
  created() {
    this.$nextTick(() => {
      this.addWaiterAction();
    });
  },
  methods: {
    ...mapActions('pos', ['addOrderItem']),

    addWaiterAction() {
      if (this.companyType === 1) {
        this.actions.unshift(
          { name: 'Waiter', icon: 'mdi-account-outline' },
        );
      }
    },

    isAllowedAction(action) {
      let allowed = false;
      switch (action) {
        case 'Bill':
          allowed = this.userCanPrintBill;
          break;
        case 'Waiter':
          allowed = this.userRole !== 3;
          break;
        case 'Settle':
          allowed = this.allowSettleBill;
          break;
        case 'Discount':
          allowed = this.userCanDiscount;
          break;
        case 'VAT':
          allowed = this.allowAddVAT;
          break;
        default:
          allowed = true;
          break;
      }
      return allowed;
    },

    listen(action) {
      if (!this.order) {
        this.$eventBus.$emit('show-snackbar', 'Please select order');
        return;
      }
      this.$eventBus.$emit('fetch-orders');
      switch (action) {
        case 'Confirm':
          if (this.hasWaiter) this.performKotPrint();
          else this.$eventBus.$emit('add-waiter');
          break;
        case 'Bill':
          this.$eventBus.$emit('print-bill');
          break;
        case 'Discount':
          this.$emit('discount');
          break;
        case 'Settle':
          this.$eventBus.$emit('settle-bill');
          break;
        case 'Waiter':
          this.$eventBus.$emit('add-waiter');
          break;
        default:
          this.$eventBus.$emit('show-snackbar', `Sorry ${action} action will be available soon!.`);
          break;
      }
    },

    async confirmOrder() {
      const params = {
        confirm_order: this.orderId,
      };
      const addItem = await this.addOrderItem(params);
      if (addItem.error) console.info(addItem.message);
      else this.$eventBus.$emit('fetch-items');
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

    .actions_pane {
        height: calc(100% - 52px);
        display: flex;
        flex-direction: column;
        gap: 10px;
        justify-content: top;
        align-items: center;
        padding-right: 10px;
        padding-top: 10px;
        padding-left: 5px;

        > div {
            height: 60px;
            width: 100%;
            background-color: $white;
            display: flex;
            gap: 10px;
            padding-left: 5px;
            align-items: center;
            color: $black;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 100%;
            border: 1px solid $bg_color;
            cursor: pointer;
            border-radius: 5px;
            overflow: hidden;

            .icon {
              color: $gray-25;
            }

            .name {
              margin: 0px;
            }
        }

        > div:hover {
          background-color: $blue;
          color: $white;
          .icon {
            color: $white;
          }
        }
    }
</style>
