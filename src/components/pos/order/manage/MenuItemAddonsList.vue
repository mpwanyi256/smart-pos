<template>
    <div class="addons-list">
        <AddonItem
            v-for="item in addons"
            :key="`addon-item-${item.id}`"
            :item="item"
            :is-pending="isPending"
            @delete="$emit('delete', item)"
        />
    </div>
</template>
<script>
import AddonItem from '@/components/pos/order/manage/AddonItem.vue';

export default {
  name: 'MenuItemAddonsList',

  props: {
    addons: {
      type: Array,
      required: true,
    },
    orderItem: {
      type: Object,
      required: true,
    },
  },

  components: {
    AddonItem,
  },

  computed: {
    isPending() {
      return this.orderItem.status === '0';
    },
  },
};
</script>
<style scoped>
    .addons-list {
      max-height: calc(60vh - 54px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
</style>
