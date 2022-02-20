<template>
    <Basemodal
        :title="`Add discount`"
        :size="600" @close="$emit('close')">
        <div class="discount_area">
            <div class="amount_display_area">
              <h1>{{ `Bill amount - ${runningOrder.bill_sum_display}` }}</h1>
              <p v-if="!isValidDiscount" class="invalid_discount">
                {{ `Sorry discount ${inputLabel} must be less than ${discountAmount}` }}
              </p>
              <p class="discount_added" v-else>{{ `Discount amount - ${discoutedAmount}` }}</p>
            </div>

            <div class="discount_options_area">
              <div class="options">
                <v-select
                  label="Select discount type"
                  outlined
                  :items="discountOptions"
                  item-text="name"
                  item-value="id"
                  v-model="discountType"
                />
              </div>
              <div class="amount_entry">
                <v-text-field min="0" v-model="discountAmount"
                  outlined type="number"
                  :label="`Enter ${inputLabel}`"
                />
              </div>
            </div>

            <div class="discount_reason">
              <v-textarea v-model="reason" rows="2" label="Reason" outlined class="reason_entry" />
            </div>

            <div class="amount_display_area">
              <v-btn class="add_discount_btn" block
                @click="addDiscount"
                :disabled="!isValidDiscount || !isValidReason">
                Add discount
              </v-btn>
            </div>

        </div>
    </Basemodal>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';

export default {
  name: 'AddDiscountModal',
  components: {
    Basemodal,
  },
  data() {
    return {
      discountType: 1,
      discountOptions: [
        { id: 1, name: 'Amount' },
        { id: 2, name: 'Percentage' },
      ],
      reason: '',
      discountAmount: 1,
    };
  },
  async created() {
    if (!this.runningOrder) this.$emit('close');
    await this.$eventBus.$emit('toggle-running');
    await this.$eventBus.$emit('fetch-items');
    await this.$eventBus.$emit('fetch-orders');
  },
  computed: {
    ...mapGetters('pos', ['runningOrder']),
    ...mapGetters('auth', ['user']),

    inputLabel() {
      return this.discountOptions.find((option) => option.id === this.discountType).name;
    },

    billTotalAmount() {
      return this.runningOrder.bill_sum ? this.runningOrder.bill_sum : 0;
    },

    discoutedAmount() {
      return this.discountType === 1 ? parseInt(this.discountAmount, 10)
        : parseInt((this.discountAmount / 100) * this.billTotalAmount, 10);
    },

    isValidDiscount() {
      return (this.discountType === 1 && this.discountAmount < this.billTotalAmount
        && this.discountAmount > 0)
        || (this.discountType === 2 && this.discountAmount < 100
        && this.discountAmount > 0);
    },

    isValidReason() {
      return this.reason.trim().length > 3;
    },
  },
  methods: {
    ...mapActions('pos', ['updateRunningOrder']),

    addDiscount() {
      const filter = {
        add_order_discount: this.runningOrder.order_id,
        discount_amount: this.discoutedAmount,
        user_id: this.user.id,
        reason: this.reason,
      };
      this.updateRunningOrder(filter)
        .then((discount) => {
          this.$eventBus.$emit('reset-running-order');
          if (!discount.error) this.$emit('close');
        }).catch((e) => {
          this.$eventBus.$emit('show-snackbar', e);
        });
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

  .discount_area {
    height: 500px;
    padding: 15px;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .discount_reason {
      height: 110px;
      overflow: hidden;
      margin-left: 10px;
      margin-right: 10px;

      .reason_entry {
        margin: 5px;
      }
    }

    .amount_display_area {
      height: 100px;
      margin-left: 10px;
      margin-right: 10px;
      border-radius: 5px;
      box-shadow: $elevation-low;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: hidden;

      .add_discount_btn {
        background-color: $blue !important;
        color: $white;
      }

      .invalid_discount {
        color: $red;
        font-weight: bold;
      }

      .discount_added {
        color: $blue;
        font-weight: bold;
      }

      .discount_reason {
        height: 10px;
        margin: 5px;
      }
    }

    .amount_display_area:last-child {
      height: auto;
      padding: 15px;
      box-shadow: none;
    }

    .discount_options_area {
      height: 100px;
      margin: 10px;
      padding: 10px;
      border-radius: 5px;
      margin-left: 10px;
      margin-right: 10px;
      // box-shadow: $elevation-low;
      display: grid;
      grid-template-columns: 50% 50%;
      gap: 10px;
    }

  }
</style>
