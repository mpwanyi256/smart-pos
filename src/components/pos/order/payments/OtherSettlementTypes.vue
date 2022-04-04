<template>
    <div class="direct_settle">
            <h2>Bill: {{ order.final_amount }}</h2>
            <v-select outlined class="settle_options"
                label="Select settlement option"
                v-model="settlementId" dense
                :items="paymentSettlements"
                item-text="name"
                item-value="id"
            />
            <BaseTextfield
                placeholder="Add payment notes or reason"
                inputType="text"
                v-model.trim="notes"
            />
            <v-btn block
              class="btn_settle"
              :disabled="!validSettlement"
              @click="settleOrder">
                Settle Bill
            </v-btn>
    </div>
</template>
<script>
import BaseTextfield from '@/components/generics/BaseTextfield.vue';

export default {
  name: 'OtherSettlementTypes',
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
      notes: '',
      settlementId: '',
    };
  },
  computed: {
    validSettlement() {
      return this.notes.length > 3 && this.settlementId > 0;
    },
    settlementDetails() {
      return parseInt(this.settlementId, 10) > 0 ? this.paymentSettlements
        .find((settlement) => settlement.id === this.settlementId) : '';
    },
    hasClient() {
      return !!this.order.client_info.firstname || !!this.order.client_info.lasname;
    },
  },
  methods: {
    settleOrder() {
      const payment = {
        settlement_id: this.settlementId,
        order_id: this.order.order_id,
        settled_by: this.user.id,
        settle_order: 'other',
        notes: this.notes.toUpperCase(),
      };
      if ([6, 3, 12].includes(parseInt(this.settlementId, 10)) && !this.hasClient) {
        this.$eventBus.$emit('show-snackbar', `Sorry, ${this.settlementDetails.name} requires a client company.`);
        return;
      }
      this.$emit('pay', payment);
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.direct_settle {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    color: $black;
    padding: 25px;

    h2 {
        text-align: center;
    }

    .btn_settle {
        background-color: $blue !important;
        color: $white;
    }

}

</style>
