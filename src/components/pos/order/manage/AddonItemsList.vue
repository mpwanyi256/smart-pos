<template>
    <div class="addons-list">
      <BaseTextfield v-model="search" placeholder="Search for an item" />
      <div class="menu">
        <template v-if="loading">
          <LoadingKds
            v-for="i in 4"
            :key="`cat-holder-key-${i}`"
            :count="8"
          />
        </template>
        <template v-else>
          <MenuItem
            v-for="item in filteredAddonItems" :key="item.id"
            :item="item"
            @addItem="addToOrderItem"
          />
        </template>
      </div>

      <AddonEntryModal
        v-if="openAddonentrymodal && selectedAddon"
        :orderItem="orderItem"
        :addon="selectedAddon"
        @close="openAddonentrymodal = false"
        @reload="refetchAddons"
      />
    </div>
</template>
<script>
import { mapActions } from 'vuex';
import MenuItem from '@/components/pos/menu/MenuItem.vue';
import LoadingKds from '@/components/kds/LoadingKds.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import AddonEntryModal from '@/components/pos/order/manage/AddonEntryModal.vue';

export default {
  name: 'AddonItemsList',
  components: {
    MenuItem,
    LoadingKds,
    BaseTextfield,
    AddonEntryModal,
  },

  props: {
    orderItem: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      loading: true,
      addonItems: [],
      search: '',
      selectedAddon: null,
      openAddonentrymodal: false,
    };
  },

  computed: {
    filteredAddonItems() {
      return this.addonItems
        .filter((addon) => addon.name.toLowerCase().includes(this.search.toLowerCase()));
    },
  },

  created() {
    this.fetchAddons();
  },

  methods: {
    ...mapActions('menu', ['getMenuItems']),

    refetchAddons() {
      this.openAddonentrymodal = false;
      this.selectedAddon = null;
      this.$eventBus.$emit('reload-item-addons');
    },

    async fetchAddons() {
      const addOns = await this.getMenuItems({ department_id: 'addons' });
      if (!addOns.error) this.addonItems = addOns.data;
      this.loading = false;
    },

    addToOrderItem(addonItem) {
      this.selectedAddon = addonItem;
      this.openAddonentrymodal = true;
    },
  },
};
</script>
<style scoped lang="scss">
.addons-list {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    .menu {
      display: grid;
      max-height: calc(60vh - 82px);
      grid-template-columns: 25% 25% 25% 25%;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
</style>
