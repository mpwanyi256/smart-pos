<template>
    <Basemodal
        :title="`${orderItem.name} addons`"
        :size="700" @close="$emit('close')">
        <div class="addons">
            <v-tabs class="tab-head" v-model="tab" color="basil" grow>
              <v-tab class="tab-item"
                  v-for="(item, index) in options"
                  :key="`settlement-option${index}`"
                  :class="isActiveTab(index) ? 'active' : ''"
              >
                  {{ item.name === 'Addons' ? `${addons.length} addons` : item.name }}
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item>
                    <MenuItemAddonsList
                      :orderItem="orderItem"
                      :addons="addons"
                      @delete="deleteAddon"
                    />
                </v-tab-item>
                <v-tab-item>
                    <AddonItemsList :orderItem="orderItem" />
                </v-tab-item>
            </v-tabs-items>
        </div>
    </Basemodal>
</template>
<script>
import { mapActions } from 'vuex';

import Basemodal from '@/components/generics/Basemodal.vue';
import MenuItemAddonsList from '@/components/pos/order/manage/MenuItemAddonsList.vue';
import AddonItemsList from '@/components/pos/order/manage/AddonItemsList.vue';

export default {
  name: 'MenuItemAddons',

  components: {
    Basemodal,
    MenuItemAddonsList,
    AddonItemsList,
  },

  props: {
    orderItem: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      options: [
        { name: 'Addons' },
        { name: 'Add more' },
      ],
      tab: 0,
      addons: [],
    };
  },

  eventBusCallbacks: {
    'reload-item-addons': 'fetchMenuItemAddons',
  },

  created() {
    this.fetchMenuItemAddons();
  },

  methods: {
    ...mapActions('pos', ['post']),

    deleteAddon(item) {
      this.post({
        drop_addon_item: item.id,
      }).then(() => {
        this.fetchMenuItemAddons();
      }).catch((e) => {
        this.showErrorMessage('Sorry, something went wrong');
        console.log('Error deleting addon', e);
      });
    },

    isActiveTab(tabIndex) {
      return tabIndex === this.tab;
    },

    fetchMenuItemAddons() {
      this.post({
        get_order_item_addons: 'all',
        order_item_id: this.orderItem.id,
      })
        .then((res) => {
          if (res.error_message) {
            this.showErrorMessage(res.error_message);
          } else {
            this.addons = res.data;
          }
        }).catch((e) => {
          console.log('Error adding addon', e);
        });
    },

    showErrorMessage(msg) {
      this.$eventBus.$emit('show-snackbar', msg);
    },
  },
};
</script>
<style scoped lang="scss">
    .addons {
        height: 60vh;
        // overflow: hidden;
    }
</style>
