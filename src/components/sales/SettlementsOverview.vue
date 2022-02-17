<template>
    <div class="settlements-overview">
        <OverviewHeader title="Settlements overview" />
        <div class="waiters-overview-list">
            <PaymentItemCard
                v-for="payment in settlements"
                :key="payment.id"
                :payment="payment"
            />
        </div>
    </div>
</template>
<script>
import OverviewHeader from '@/components/sales/OverviewHeader.vue';
import PaymentItemCard from '@/components/sales/PaymentItemCard.vue';

export default {
  name: 'SettlementsOverview',
  props: {
    settlements: {
      type: Array,
      required: true,
    },
  },
  components: {
    OverviewHeader,
    PaymentItemCard,
  },
};
</script>
<style lang="scss">
@import '@/styles/constants.scss';

.settlements-overview {
    min-height: 100%;
    background-color: $body-bg;

    .waiters-overview-list {
      height: calc(100vh - 222px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 3px;
      border-right: 0.5px solid $gray-80;
    }
}

</style>
