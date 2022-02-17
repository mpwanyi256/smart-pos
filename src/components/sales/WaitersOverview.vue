<template>
    <div class="waiters-overview">
        <OverviewHeader title="Waiters overview" />
        <div class="waiters-overview-list">
            <Waiter
              v-for="waiter in waiters"
              :key="waiter.id"
              :waiter="waiter"
            />
        </div>
    </div>
</template>
<script>
import OverviewHeader from '@/components/sales/OverviewHeader.vue';
import Waiter from '@/components/sales/Waiter.vue';

export default {
  name: 'WaitersOverview',
  props: {
    waiters: {
      type: Array,
      required: true,
    },
  },
  components: {
    OverviewHeader,
    Waiter,
  },
};
</script>
<style lang="scss">
@import '@/styles/constants.scss';

.waiters-overview {
    min-height: 100%;
    background-color: $body-bg;
    border-right: 0.5px solid $gray-80;

    .waiters-overview-list {
      height: calc(100vh - 222px);
      overflow-y: auto;
    }
}

</style>
