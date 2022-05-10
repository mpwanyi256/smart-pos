<template>
    <Table>
        <template slot="header">
            <tr>
              <th colspan="2">
                <BaseTextfield v-model="search" placeholder="Search ..." />
              </th>
            </tr>
        </template>
        <template slot="body">
            <tr
                v-for="item in filteredStoreItems" :key="item.id"
            >
                <td>{{ item.name }}</td>
                <td>
                    <v-btn :disabled="exists(item)" small @click="addItem(item)">
                        Add to list
                    </v-btn>
                </td>
            </tr>
        </template>
    </Table>
</template>
<script>
import { mapActions } from 'vuex';
import Table from '@/components/generics/new/Table.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';

export default {
  name: 'AddStoreItemToMapping',
  props: {
    storeItems: {
      type: Array,
      required: true,
    },
    supplier: {
      type: Object,
      required: true,
    },
    mappings: {
      type: Array,
      required: true,
    },
  },
  components: {
    Table,
    BaseTextfield,
  },
  data() {
    return {
      search: '',
      loading: false,
    };
  },
  watch: {
    search: {
      handler(val) {
        if (val.length >= 3 || val.length === 0) {
          this.$emit('search', val);
        }
      },
      immediate: true,
    },
  },
  computed: {
    filteredStoreItems() {
      return this.storeItems;
    },
  },
  methods: {
    ...mapActions('inventory', ['updateItem']),

    exists(item) {
      return this.mappings.findIndex((Item) => Item.store_item_id === item.id) >= 0;
    },

    async addItem(item) {
      this.loading = true;
      const mapping = {
        item_id: item.id,
        supplier_id: this.supplier.id,
        add_supplier_item_mapping: true,
      };
      const updateMappung = await this.updateItem(mapping);
      if (!updateMappung.error) this.$emit('reload');
      this.loading = false;
    },
  },
};
</script>
