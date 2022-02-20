<template>
    <Basemodal
        :title="`Settle order`"
        :size="800" @close="$emit('close')">
        <div class="settle">
            <v-tabs class="tab-head" v-model="tab" color="basil" grow>
              <v-tab class="tab-item"
                  v-for="(item, index) in options"
                  :key="`settlement-option${index}`"
                  :class="isActiveTab(index) ? 'active' : ''"
              >
                  {{ item.name }}
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item>
                    <DirectSettlement
                      :paymentSettlements="directSettlementOptions"
                      :user="user"
                      @pay="savePayment"
                      :order="runningOrder"
                    />
                </v-tab-item>
                <v-tab-item>
                    <SplitSettlement
                      :paymentSettlements="directSettlementOptions"
                      :user="user"
                      :order="runningOrder"
                      @pay="savePayment"
                    />
                </v-tab-item>
                <v-tab-item>
                  <CompanySettlement
                    :clients="clients"
                    :user="user"
                    :order="runningOrder"
                    @pay="savePayment"
                  />
                </v-tab-item>
                <v-tab-item>
                  <OtherSettlementTypes
                      :paymentSettlements="otherSettlementOptions"
                      :user="user"
                      :order="runningOrder"
                      @pay="savePayment"
                  />
                </v-tab-item>
            </v-tabs-items>
            <v-alert
              class="ma-2"
              v-if="errorMessage"
              shaped outlined
              dismissible
              type="error" @click="errorMessage = ''">
              {{ errorMessage }}
            </v-alert>
        </div>
    </Basemodal>
</template>
<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import DirectSettlement from '@/components/pos/order/DirectSettlement.vue';
import SplitSettlement from '@/components/pos/order/SplitSettlement.vue';
import OtherSettlementTypes from '@/components/pos/order/payments/OtherSettlementTypes.vue';
import CompanySettlement from '@/components/pos/order/payments/CompanySettlement.vue';

export default {
  name: 'OrderSettlementModal',
  components: {
    Basemodal,
    DirectSettlement,
    SplitSettlement,
    OtherSettlementTypes,
    CompanySettlement,
  },
  data() {
    return {
      options: [
        { name: 'Direct' },
        { name: 'Split' },
        { name: 'Company' },
        { name: 'Other' },
      ],
      tab: 0,
      allowedOptions: [
        1, 2, 10,
      ],
      otherSettlements: [
        3, 6, 9, 11, 12,
      ],
      clients: [],
      errorMessage: '',
      loading: false,
    };
  },
  computed: {
    ...mapGetters('pos', ['runningOrder']),
    ...mapState('pos', ['paymentSettlements']),
    ...mapGetters('auth', ['user']),

    directSettlementOptions() {
      return this.paymentSettlements.filter((Option) => this.isAllowed(Option.id));
    },

    otherSettlementOptions() {
      return this.paymentSettlements.filter((Option) => this.isOtherPaymentType(Option.id));
    },
  },
  async created() {
    this.errorMessage = '';
    await this.fetchsetpaymentSettlements();
    await this.fetchClients();
  },
  methods: {
    ...mapActions('sales', ['getClients']),
    ...mapActions('pos', ['fetchsetpaymentSettlements', 'updateOrder', 'setRunningOrderId', 'setRunningOrder']),

    async fetchClients() {
      const posClients = await this.getClients('all');
      if (!posClients.error) this.clients = posClients.data;
    },

    savePayment(settlement) {
      if (this.loading) return;
      this.loading = true;
      this.errorMessage = '';
      this.updateOrder({ ...settlement, discount_note: 'none' })
        .then(async (settleOrder) => {
          if (!settleOrder.error) {
            this.setRunningOrderId(null);
            this.setRunningOrder(null);
            this.$eventBus.$emit('clear-running-order-items');
            await this.$eventBus.$emit('fetch-orders');
            this.$nextTick(() => {
              this.$emit('close');
            });
          } else {
            this.errorMessage = settleOrder.message;
          }
        })
        .catch((e) => {
          this.errorMessage = e.message;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    isOtherPaymentType(SettlementId) {
      return this.otherSettlements.findIndex((Option) => Option === SettlementId) >= 0;
    },

    isAllowed(SettlementId) {
      return this.allowedOptions.findIndex((Option) => Option === SettlementId) >= 0;
    },

    isActiveTab(tabIndex) {
      return tabIndex === this.tab;
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

    .settle {
        height: auto;
        padding-bottom: 3px;
        background-color: $white;

        .tab-head {
            background-color: $white;

            .active {
                background-color: $blue;
                color: $white;
                border-bottom: 1px solid $white !important;
            }
        }
    }
</style>
