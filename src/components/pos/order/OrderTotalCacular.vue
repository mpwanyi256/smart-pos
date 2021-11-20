<template>
    <div class="summary_info">
        <div class="order_summmary">
            <div class="item_name">
                Total
            </div>
            <div class="item_price">
                {{ order.bill_sum_display }}
            </div>
            <div class="item_actions">
                &nbsp;
            </div>
        </div>
        <div v-if="showVat" class="order_summmary">
            <div class="item_name">
                VAT INCL
            </div>
            <div class="item_price">
                {{ order.vat_included }}
            </div>
        </div>
        <div v-if="order.discount != '0'" class="order_summmary">
            <div class="item_name">
                Discount
            </div>
            <div class="item_price">
                {{ order.discount }}
            </div>
        </div>
        <div v-if="order.discount != '0' || showVat" class="order_summmary">
            <div class="item_name">
                BILL
            </div>
            <div class="item_price">
                {{ order.final_amount }}
            </div>
        </div>
    </div>
</template>
<script>

export default {
  name: 'OrderTotalCacular',

  props: {
    order: {
      type: Object,
      required: true,
    },
    showVat: {
      type: Boolean,
      required: false,
      default: () => false,
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/pos.scss';
    .summary_info {
        overflow: hidden;
        padding-top: 10px;

        .order_summmary:first-child, .order_summmary:last-child {
            // border-top: 1px solid $header;
            font-weight: bold;
        }

        .order_summmary:last-child {
            // border-bottom: 1px solid $header;
            font-weight: bold;
            height: 50px;
        }

        .order_summmary {
            height: 30px;
            width: inherit;
            background-color: inherit;
            display: grid;
            grid-template-columns: 80% 20%;
            font-size: 14px;
            color: $black;

            .item_name {
                display: flex;
                flex-direction: row;
                justify-content: left;
                padding-left: 10px;
                line-height: 1.5;
                text-overflow: ellipsis;
                overflow: hidden;
                width: 100%;
                white-space: nowrap;
                padding-right: 5px;
            }

            .item_price {
                justify-content: center;
                text-align: center;
            }

            .item_name, .item_actions, .item_price {
                display: flex;
                align-items: center;
            }

            .item_actions {
                direction: ltr;
                font-size: 14px;
            }
        }
    }
</style>
