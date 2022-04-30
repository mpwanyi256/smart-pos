<template>
  <div class="inv_main">
    <div class="header_section">
      <div class="title">Store Items</div>
      <div class="options">
        <div>
          <BaseTooltip
            @button="createItem = true"
            message="Create Item" icon="plus"
          />
        </div>
          <div>
          <v-text-field dense outlined label="Search" v-model="search" />
          </div>
      </div>
    </div>
    <div class="items_list">
      <StoreItemsList
        @update="updateItem"
        @reload="reloadItems"
      />
    </div>
    <Pagination @change="page = $event" :length="totalPaginationItems" />
    <UpdateStoreItem
      v-if="updateItemModal && selectedItem"
      :item="selectedItem"
      @close="updateItemModal = false"
      @reload="reloadItems"
    />
    <CreateStoreItemModal
      v-if="createItem"
      @close="createItem = false"
      @reload="reloadItems"
    />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import StoreItemsList from '@/components/inventory/store/StoreItemsList.vue';
import UpdateStoreItem from '@/components/inventory/store/UpdateStoreItem.vue';
import CreateStoreItemModal from '@/components/inventory/store/CreateStoreItemModal.vue';
import Pagination from '@/components/generics/new/Pagination.vue';

export default {
  name: 'StoreItems',
  components: {
    BaseTooltip,
    StoreItemsList,
    UpdateStoreItem,
    CreateStoreItemModal,
    Pagination,
  },
  data() {
    return {
      updateItemModal: false,
      selectedItem: null,
      search: '',
      createItem: false,
      page: 1,
      itemsPerPage: 15,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('inventory', ['storeItems', 'loading', 'totalStoreItems']),

    totalPaginationItems() {
      return Math.ceil(this.totalStoreItems / this.itemsPerPage);
    },
  },
  watch: {
    display() {
      this.reloadItems();
    },
    page() {
      this.$nextTick(() => {
        this.loadItems();
      });
    },
    search: {
      handler(val) {
        if (val.length >= 2 || val.length === 0) {
          this.loadItems();
        }
      },
      immediate: false,
    },
  },
  methods: {
    ...mapActions('inventory', ['getStoreItems']),

    updateItem(item) {
      this.selectedItem = item;
      this.updateItemModal = true;
    },

    async reloadItems() {
      this.loadItems();
      this.selectedItem = null;
      this.createItem = false;
      this.updateItemModal = false;
    },

    loadItems() {
      this.getStoreItems({
        type: 'paginated',
        company_id: this.user.company_id,
        page: this.page,
        search: this.search.trim(),
      });
    },
  },
  created() {
    this.loadItems();
  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

.inv_main {
  width: 100%;
  height: calc(100vh - 52px);
  display: flex;
  flex-direction: column;

  .header_section {
    height: 52px;
    background-color: $white;
    padding-left: 15px;
    border-bottom: 1px solid $light-grey;
    display: grid;
    grid-template-columns: 60% 40%;
    justify-content: center;
    align-items: center;
    color: $black;

    .options {
      display: inline-flex;
      gap: 5px;
      padding-top: 5px;
      direction: rtl;
      padding-right: 15px;
      text-align: left;

      > div {
        direction: ltr;
      }
    }
  }
}
</style>
