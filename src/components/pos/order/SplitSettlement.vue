<template>
    <div class="split_settlement">
        <h1 class="text-center"> Bill sum {{ order.final_amount }} </h1>
        <div class="payment_option"
            v-for="payment in paymentSettlements"
            :key="payment.id"
        >
            <p>{{ payment.name }}</p>
            <BaseTextfield
              :placeholder="payment.name"
              inputType="number"
              v-model.trim="payments[`${payment.name.toLowerCase().split(' ')[0]}`]"
            />
        </div>
        <div class="settlement_btn">
            <v-btn
            :disabled="!isValidPayment"
            @click="settleOrder"
            class="make_payment float-right">
              SETTLE
            </v-btn>
        </div>
    </div>
</template>
<script>
import BaseTextfield from '@/components/generics/BaseTextfield.vue';

export default {
  name: 'SplitSettlement',
  props: {
    order: {
      type: Object,
      required: true,
    },
    paymentSettlements: {
      type: Array,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  components: {
    BaseTextfield,
  },
  data() {
    return {
      payments: {
        cash: 0,
        mobile: 0,
        visa: 0,
      },
    };
  },
  computed: {
    billSum() {
      return parseInt(this.order.final_bill_amount, 10);
    },
    isValidPayment() {
      const paymentsAdded = Object.values(this.payments);
      // eslint-disable-next-line max-len
      const reducer = (accumulator, currentValue) => parseInt(accumulator, 10) + parseInt(currentValue, 10);
      return paymentsAdded.reduce(reducer, 0) === this.billSum;
    },
  },
  methods: {
    settleOrder() {
      const PAY = {
        settlement_id: 7,
        order_id: this.order.order_id,
        settled_by: this.user.id,
        settle_order: 'split',
        ...this.payments,
      };
      this.$emit('pay', PAY);
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.split_settlement {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    color: $black;
    padding: 25px;

    .payment_option {
      height: 50px;
      display: grid;
      grid-template-columns: 50% 50%;
      align-items: center;
      justify-content: center;

      p {
        text-align: left;
        margin-left: 150px;
        font-size: 18px;
        justify-content: center;
      }
    }

    .settlement_btn .make_payment {
      background-color: $blue !important;
      color: $white;
    }

}

</style>
