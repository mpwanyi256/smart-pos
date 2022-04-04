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

    ::-webkit-scrollbar {
      width: 5px !important;
      height: 5px !important;
    }

    ::-webkit-scrollbar-thumb {
      background: $scrollbar-color !important;
      border-radius: 1ex !important;
      -webkit-border-radius: 1ex !important;
    }

    ::-webkit-scrollbar-corner {
      background: #000 !important;
    }

    .waiters-overview-list {
      height: calc(100vh - 222px);
      overflow-y: auto;
    }
}

</style>
