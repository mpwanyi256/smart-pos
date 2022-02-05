<template>
  <Settlements class="sales_overview" />
</template>
<script>
import Settlements from '@/components/sales/settlements.vue';

export default {
  name: 'DashboardSalesOverview',
  components: {
    Settlements,
  },
};
</script>
<style scoped lang="scss">
  .sales_overview {
      width: 100%;
      min-height: 100%;
      background-color: inherit;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 10px;
  }
</style>
