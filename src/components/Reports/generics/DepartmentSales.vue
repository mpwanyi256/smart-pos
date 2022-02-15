<template>
    <div class="department">
        <h3>{{ info.name }}</h3>
        <Table>
            <template slot="header">
                <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>Unit price</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                    <th>Av. Cost Of Sales</th>
                    <th>Total COS</th>
                </tr>
            </template>
            <template slot="body">
                <tr v-for="(item, i) in info.items_sold" :key="i">
                    <td>
                        <template v-if="item.name == 'Total'">
                            &nbsp;
                        </template>
                        <template v-else>
                        {{ i+1 }}
                        </template>
                    </td>
                    <td>
                        <template v-if="item.name == 'Total'">
                            <strong>{{ item.name }}</strong>
                        </template>
                        <template v-else>
                        {{ item.name }}
                        </template>
                    </td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>
                        <template v-if="item.name == 'Total'">
                            <strong>{{ item.amount }}</strong>
                        </template>
                        <template v-else>
                            {{ item.amount }}
                        </template>
                    </td>
                    <td>{{ item.average_cost_price }}</td>
                    <td>{{ item.item_cost_price }}</td>
                </tr>
                <tr>
                    <td colspan="4"><strong class="float-right">TOTAL</strong></td>
                    <td>
                        <strong>{{ info.total_sale }}</strong>
                    </td>
                    <td><strong class="float-right"></strong></td>
                    <td><strong></strong></td>
                </tr>
            </template>
        </Table>
    </div>
</template>
<script>
import Table from '@/components/generics/new/Table.vue';

export default {
  name: 'DepartmentSale',
  props: {
    info: {
      type: Object,
      required: true,
    },
  },
  components: {
    Table,
  },
};
</script>
<style scoped lang="scss">
.department {
    min-height: 200px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
    // overflow: auto;
    // border: 1px solid #e2e2e2;

    h3 {
        margin: 10px;
    }
}
</style>
