<template>
  <Basemodal :title="supplier.name" :size="1000"
    @close="$emit('close')">
    <div class="supplier_mappings">
        <div class="mappings">
            <SupplierItemMappings
              :mappings="mappings"
              @reload="fetchMappings"
            />
        </div>
        <InfiniteScroll class="add_mapping" @refetch="refetchItems" :hasNext="hasNext">
          <template #content>
            <AddStoreItemToMapping
              :storeItems="storeItems"
              :supplier="supplier"
              :mappings="mappings"
              @search="search = $event"
              @reload="fetchMappings"
            />
            </template>
          </InfiniteScroll>
    </div>
  </Basemodal>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import AddStoreItemToMapping from '@/components/inventory/suppliers/AddStoreItemToMapping.vue';
import SupplierItemMappings from '@/components/inventory/suppliers/SupplierItemMappings.vue';
import Basemodal from '@/components/generics/Basemodal.vue';
import InfiniteScroll from '@/components/generics/new/InfiniteScroll.vue';

export default {
  name: 'SupplierItemMapping',
  props: {
    supplier: {
      type: Object,
      required: true,
    },
  },
  components: {
    Basemodal,
    AddStoreItemToMapping,
    SupplierItemMappings,
    InfiniteScroll,
  },
  data() {
    return {
      mappings: [],
      page: 1,
      hasNext: false,
      storeItems: [],
      search: '',
      loading: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
  },
  watch: {
    search: {
      handler(val) {
        if (val.length >= 3 || val.length === 0) {
          this.page = 1;
          this.getStoreItems();
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('inventory', ['updateItem', 'fetchPurchaseItems']),

    refetchItems() {
      this.page += 1;
      this.$nextTick(() => {
        this.getStoreItems();
      });
    },
    getStoreItems() {
      this.loading = true;
      this.fetchPurchaseItems({
        type: 'paginated',
        page: this.page,
        search: this.search,
        company_id: this.user.company_id,
      })
        .then((res) => {
          if (this.search.length > 0) {
            this.storeItems = res.data;
          } else {
            this.storeItems = [...this.storeItems, ...res.data];
          }
          this.hasNext = res.has_next;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    async fetchMappings() {
      const Mappings = await this.updateItem({
        fetch_supplier_mapping: this.supplier.id,
      });
      if (!Mappings.error) this.mappings = Mappings.data;
    },
  },
  async created() {
    await this.fetchMappings();
    await this.getStoreItems();
  },
};

</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

    .supplier_mappings {
      height: 500px;
      display: grid;
      grid-template-columns: 50% 50%;
      margin: 0;
      top: 0;
      bottom: 0;
      overflow: hidden;

      >div {
        display: flex;
        flex-direction: column;
      }

      .mappings {
        overflow: auto;
        top: 0;
        bottom: 0;
      }

      .add_mapping {
        background-color: $light-grey;
        overflow-y: auto;
        overflow-x: hidden;
      }
    }
</style>
