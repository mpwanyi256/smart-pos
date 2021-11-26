<template>
    <Basemodal :size="700" :title="modalTitle" @close="$emit('close')">
        <div>
            <v-spacer></v-spacer>
            <v-btn small @click="performBillPrint"
                class="ma-2 float-right" outlined fab color="teal">
                <v-icon>mdi-printer</v-icon>
            </v-btn>
        </div>
        <div ref="tableView">
            <PageAlert v-if="errorMessage" :message="errorMessage" @close="errorMessage= ''" />
            <div class="order_view">
            <table class="tableView" style="margin:0px;padding:0px;font-family:sans-serif;
            width: 100%;background-color:rgba(255, 255, 255, 0.91);top:0;left:0;">
                <tr style="text-align:center;"><th colspan="4">
                    <small>{{ company.company_name }}</small></th>
                    </tr>
                <tr style="text-align:center;font-size:12px;">
                    <td colspan="4">{{ company.company_location }}
                        <br> {{ company.company_mobile }}</td>
                </tr>
                <tr style="text-align:center;font-size:14px;">
                    <td colspan="4"><small>
                        <strong>TAX INVOICE {{ order.bill_no}}</strong></small>
                    </td>
                </tr>
                <tr><td colspan="4"><hr></td></tr>
                <!-- <tr><td colspan="4"><small><strong>Table:</strong> {{ order.table}}
                    &nbsp;</small></td>
                </tr> -->
                <tr><td colspan="4"><small><strong>SERVED By:</strong>
                    {{ order.waiter ? order.waiter.toUpperCase() : ''}}</small></td>
                </tr>
                <tr><td colspan="4">
                    <small>
                        <strong>DATE:</strong> {{ order.date }} &nbsp; | {{ order.time }}
                    </small></td>
                </tr>
                <tr><td colspan="4"><small><strong>Printed By:</strong>
                    {{ user.user_name }}</small><hr></td>
                </tr>
                <template v-if="order.client_name">
                    <tr style="font-size:12px;"><td colspan="4">
                        <strong>CLIENT DETAILS</strong></td>
                    </tr>
                    <tr style="font-size:12px;">
                        <td colspan="4">
                            <strong>NAME:</strong> {{ order.client_info.firstname }} &nbsp;
                            {{ order.client_info.lasname }}
                        </td>
                    </tr>
                    <tr style="font-size:12px;">
                        <td colspan="4">
                            <strong>ADDRESS:</strong> {{ order.client_info.address }}</td>
                    </tr>
                    <tr style="font-size:12px;">
                        <td colspan="4">
                            <strong>TIN:</strong> {{ order.client_info.tin }}</td>
                    </tr>
                    <tr style="font-size:12px;">
                        <td colspan="4">
                            <strong>EMAIL:</strong> {{ order.client_info.email }}</td>
                    </tr>
                    <tr style="font-size:12px;">
                        <td colspan="4">
                            <strong>CONTACT:</strong> {{ order.client_info.contact_number }}</td>
                    </tr>
                    <tr><td colspan="4"><hr></td></tr>
                </template>
                <tr style="font-size:14px;font-style:bold;">
                    <td colspan="3">ITEM</td><td style="text-align: right;">Amount</td>
                </tr>
                <tr><td colspan="4"><hr></td></tr>
                <tr v-for="item in orderItems" :key="item.id">
                    <td style="text-align:left; margin-right:0px;" colspan="3">
                        <small>{{ item.quantity }}&nbsp;
                            {{ item.item_name.toUpperCase() }}
                        </small>
                    </td>
                    <td style="text-align:right;">
                        <small>{{ item.amount }}</small>
                    </td>
                </tr>
                <tr><td colspan="4"><hr></td></tr>
                <tr>
                    <td style="text-align:left; margin-right:0px;" colspan="3">
                        <strong>TOTAL</strong>
                    </td>
                    <td style="text-align:right;">
                        <strong>{{ order.bill_sum_display }}</strong>
                    </td>
                </tr>
                <template v-if="showVatCalcular">
                    <tr>
                        <td style="text-align:left; margin-right:0px;" colspan="3">
                            VAT INCL
                        </td>
                        <td style="text-align:right;">
                            {{ vatAddedAmount }}
                        </td>
                    </tr>
                    <tr><td colspan="4"><br><hr></td></tr>
                </template>
                <template v-if="order.discount != '0'">
                    <tr>
                    <td
                        style="text-align:left; margin-right:0px;" colspan="3">
                        <small>DISCOUNT</small>
                    </td>
                    <td style="text-align:right;">
                        <small>{{ order.discount }}</small>
                    </td>
                    </tr>
                </template>
                <template v-if="showVATCalc || order.discount != '0'">
                    <tr>
                        <td
                            style="text-align:left; margin-right:0px;" colspan="3">
                            <strong>BILL TOTAL</strong>
                        </td>
                        <td style="text-align:right;">
                            <strong>{{ order.final_amount }}
                            </strong>
                        </td>
                    </tr>
                    <tr><td colspan="4"><hr></td></tr>
                </template>
                <tr><td colspan="4" style="text-align:center;">
                    <small>Powered By PRODEV GROUP | +256 (706) 523078
                        <br> {{ company.company_receipt }}
                    </small>
                </td></tr>
            </table>
            </div>
        </div>

    </Basemodal>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import PrintMixin from '@/mixins/PrintingMixin';
import PageAlert from '@/components/alerts/PageAlert.vue';
import ControlsMixin from '@/mixins/ControlsMixin';

export default {
  name: 'Bill',
  mixins: [PrintMixin, ControlsMixin],
  components: {
    Basemodal,
    PageAlert,
  },
  props: {
    order: {
      type: Object,
      required: true,
    },
    showVATCalc: {
      type: Boolean,
      required: false,
      default: () => false,
    },
  },
  data() {
    return {
      modalTitle: 'Bill',
      orderItems: [],
      billDiscount: 0,
      finalBillAmount: 0,
      errorMessage: '',
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
    company() {
      return this.user ? this.user.company_info : null;
    },

    vatAddedAmount() {
      // Add vat added to bill incase allowAddVAT == true
      return (this.showVatCalcular && !this.allowAddVAT) ? this.order.vat_included : 0;
    },
  },
  watch: {
    errorMessage(val) {
      if (!val) return;
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    },
  },
  methods: {
    ...mapActions('sales', ['getOrderItems']),
    ...mapActions('pos', ['updateOrder']),

    async printBill() {
      this.updateOrder({ update_bill_print_status: this.order.order_id })
        .then((res) => {
          if (res.error) {
            this.errorMessage = 'Error printing bill';
            return;
          }
          this.$eventBus.$emit('reload-order');
          this.$emit('close');
        }).catch((e) => {
          console.log('Error updating bill was printed', e);
        });
    },
  },
  async created() {
    this.$eventBus.$emit('fetch-orders');
    const items = await this.getOrderItems(this.order.order_id);
    if (!items.error) {
      this.orderItems = items.data;
      this.billDiscount = this.order.discount;
      this.finalBillAmount = this.order.final_amount;
    }
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/pos.scss';

    .tableView .order_view {
        padding: 15px;
    }
</style>
