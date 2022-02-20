<template>
    <Basemodal
      :title="''"
      :size="1000" @close="$emit('close')">
        <div class="item-details">
            <v-tabs class="tab-head" v-model="tab" color="basil" grow>
              <v-tab class="tab-item"
                  v-for="(item, index) in options"
                  :key="`option${index}`"
                  :class="isActiveTab(index) ? 'active' : ''"
              >
                  {{ options[index].name }}
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item>
                    <ItemSaleOverview :item="item" :duration="duration" />
                </v-tab-item>
                <v-tab-item>
                    {{ tab }}
                </v-tab-item>
            </v-tabs-items>
        </div>
    </Basemodal>
</template>
<script>
import Basemodal from '@/components/generics/Basemodal.vue';
import ItemSaleOverview from '@/views/dashboard/sales/reports/generic/ItemSaleOverview.vue';

export default {
  name: 'ItemSoldDetailsModal',
  components: {
    Basemodal,
    ItemSaleOverview,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    duration: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      options: [
        { name: 'Overview' },
        // { name: 'Cost of sales' },
      ],
      tab: 0,
    };
  },
  computed: {
    modalTitle() {
      return `${this.item.item_name}`;
    },
  },
  methods: {
    isActiveTab(tabIndex) {
      return tabIndex === this.tab;
    },
  },
};
</script>
<style scoped lang="scss">
.item-details {
    min-height: 100px;
    display: flex;
    flex-direction: column;
    top: 0;
    bottom: 0;
    margin: 0;
}
</style>
