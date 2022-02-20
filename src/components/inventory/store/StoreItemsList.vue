<template>
  <div class="stores">
    <Table>
      <template slot="header">
        <th v-for="(head, index) in headers" :key="index">
          {{ head }}
        </th>
      </template>
      <template slot="body">
          <tr v-for="item in filteredItems" :key="`store-item-${item.id}`">
              <td>{{ item.name }}</td>
              <td>{{ item.unit_price_display }}</td>
              <td>{{ item.pack_size }}</td>
              <td>{{ item.unit_measure }}</td>
              <td> {{ item.min_stock }} </td>
              <td>
                <v-btn @click="$emit('update', item)" class="action" small icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </td>
          </tr>
      </template>
    </Table>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import Table from '@/components/generics/new/Table.vue';

export default {
  name: 'StoreItemsList',
  components: {
    Table,
  },
  props: {
    search: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      headers: [
        'Item Name',
        'Unit Price',
        'Pack size',
        'Measurement',
        'Min Stock',
        '',
      ],
    };
  },
  computed: {
    ...mapGetters('inventory', ['storeItems']),

    filteredItems() {
      return this.search.length ? this.storeItems
        .filter((item) => item.name.toLowerCase()
          .match(this.search.toLowerCase())) : this.storeItems;
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../../styles/constants.scss';

  .stores {
    height: calc(100vh - 104px);
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
