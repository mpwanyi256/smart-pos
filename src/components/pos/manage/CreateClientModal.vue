<template>
    <Basemodal
      :title="`Add client details to order`"
      :size="1020" @close="$emit('close')">
      <div class="manager_actions">
        <v-tabs v-model="tab" background-color="transparent"
          color="basil" grow
        >
          <v-tab v-for="item in tabs" :key="item">
            {{ item }}
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-card flat>
              <v-card-title>
                <div class="selected-client">
                  <BaseTextfield v-model="search" />
                </div>
                <div v-if="errorMessage">{{ errorMessage }}</div>
              </v-card-title>
              <div class="client_list">
                <Client
                  v-for="client in filteredClients"
                  :key="client.id"
                  :client="client"
                  @select="setClientInfoOnBill($event)"
                />
              </div>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <div class="client_list">
              <CreateNewClient
                @add="setClientInfoOnBill({ id: $event })"
              />
            </div>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </Basemodal>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import CreateNewClient from '@/components/pos/manage/CreateNewClient.vue';
import Client from '@/components/pos/manage/Client.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';

export default {
  name: 'CreateClientMOdal',
  props: {
  },
  components: {
    Basemodal,
    CreateNewClient,
    Client,
    BaseTextfield,
  },
  data() {
    return {
      loading: false,
      message: '',
      tabs: ['Existing client', 'New client'],
      tab: null,
      clients: [],
      search: '',
      selectedClient: null,
      errorMessage: '',
    };
  },
  computed: {
    ...mapGetters('pos', ['runningOrderId']),

    filteredClients() {
      return this.clients.filter((C) => C.full_name
        .toLowerCase().match(this.search.toLowerCase()));
    },
  },
  async created() {
    await this.fetchClients();
  },
  methods: {
    ...mapActions('sales', ['getClients', 'addClientInfo']),

    async setClientInfoOnBill(client) {
      const response = await this.addClientInfo({
        add_client_info: client.id,
        order_id: this.runningOrderId,
      }).catch(() => null);

      if (response && !response.error) {
        await this.$eventBus.$emit('reset-running-order', this.runningOrderId);
        // await this.$eventBus.$emit('fetch-orders');
        await this.fetchClients();
        this.$emit('close');
      } else {
        this.errorMessage = response.message;
      }
    },

    async fetchClients() {
      const posClients = await this.getClients('all');
      if (!posClients.error) this.clients = posClients.data;
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

  .manager_actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
    min-height: 400px;
    color: $black;
    padding: 15px;
  }

  .client_list {
    height: 350px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid $border_color;
  }

  .selected-client {
    display: inline-flex;
    align-content: center;
    gap: 15px;
    height: 64px;
    width: 100%;
    border-bottom: 1px solid $border_color;
    padding: 8px;
  }

</style>
