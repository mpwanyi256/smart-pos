<template>
    <Basemodal
        :title="`${orderItem.name} addons`"
        :size="700" @close="$emit('close')">
        <div class="addons">
            <MenuItemAddonsList
              :orderItem="orderItem"
              :addons="addons"
            />
        </div>
    </Basemodal>
</template>
<script>
import { mapActions } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import MenuItemAddonsList from '@/components/pos/order/manage/MenuItemAddonsList.vue';

export default {
  name: 'MenuitemAddonsDisplay',

  props: {
    orderItem: {
      type: Object,
      required: true,
    },
  },

  components: {
    Basemodal,
    MenuItemAddonsList,
  },

  data() {
    return {
      addons: [],
    };
  },

  created() {
    this.fetchMenuItemAddons();
  },

  methods: {
    ...mapActions('pos', ['post']),

    DeleteAddon(item) {
      console.log('Drop addon', item);
    },

    fetchMenuItemAddons() {
      this.post({
        get_order_item_addons: 'all',
        order_item_id: this.orderItem.id,
      })
        .then((res) => {
          if (res.error_message) {
            this.$eventBus.$emit('show-snackbar', res.error_message);
          } else {
            this.addons = res.data;
          }
        }).catch((e) => {
          console.log('Error adding addon', e);
        });
    },

  },
};
</script>
<style scoped>
    .addons {
      min-height: 50px;
      max-height: calc(60vh - 54px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
</style>
