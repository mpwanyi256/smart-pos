<template>
    <PageTemplate title="Company outlets">
        <template slot="header-actions">
        <BaseTextfield v-model="search" placeholder="Search" />
        <v-btn fab small @click="createOutlet = true">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <template slot="body">
        <Table>
            <template slot="header">
                <tr>
                <th>#</th>
                <th>Name</th>
                <th>Location</th>
                <th>Currency</th>
                <th>&nbsp;</th>
                </tr>
            </template>
            <template slot="body">
                <tr v-for="(outlet, i) in outlets" :key="`propertyUnit${outlet.id}`">
                    <td>{{ ++i }}</td>
                    <td>{{ outlet.name }}</td>
                    <td>{{ outlet.location }}</td>
                    <td>{{ outlet.currency }}</td>
                    <td>
                        <v-btn icon small @click="update(outlet)">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                    </td>
                </tr>
            </template>
        </Table>
        <CreateOutlet
            v-if="createOutlet"
            @close="createOutlet = false"
        />
        <UpdateOutlet
            v-if="updateOutlet && selectedOutlet"
            :outlet="selectedOutlet"
            @close="updateOutlet = false"
        />
      </template>
    </PageTemplate>
</template>
<script>
import { mapActions } from 'vuex';
import PageTemplate from '@/views/estates/PageTemplate.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import Table from '@/components/generics/new/Table.vue';
import CreateOutlet from '@/components/settings/CreateOutlet.vue';
import UpdateOutlet from '@/components/settings/UpdateOutlet.vue';

export default {
  name: 'Outlets',
  components: {
    PageTemplate,
    BaseTextfield,
    Table,
    CreateOutlet,
    UpdateOutlet,
  },
  data() {
    return {
      outlets: [],
      createOutlet: false,
      search: '',
      selectedOutlet: null,
      updateOutlet: false,
    };
  },
  watch: {
    async createOutlet() {
      await this.getOutlets();
    },
    async updateOutlet() {
      await this.getOutlets();
    },
  },
  async created() {
    await this.getOutlets();
  },
  methods: {
    ...mapActions('settings', ['post']),

    async getOutlets() {
      const OUTLETS = await this.post({ fetch_company_outlets: 'all' }).catch(() => null);
      if (OUTLETS) this.outlets = OUTLETS.data;
    },

    update(outlet) {
      this.selectedOutlet = outlet;
      this.updateOutlet = true;
    },
  },
};
</script>
