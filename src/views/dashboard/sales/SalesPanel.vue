<template>
    <div class="panel-sales">
      <TotalSale/>
      <SalesNavBar :links="links" />
    </div>
</template>
<script>
import TotalSale from '@/components/sales/TotalSale.vue';
import SalesNavBar from '@/components/nav/SalesNavBar.vue';

export default {
  name: 'SalesPanel',
  components: {
    TotalSale,
    SalesNavBar,
  },
  props: {
    user: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      selectedOrder: null,
      links: [
        { name: 'Dashboard', icon: 'mdi-view-dashboard', path: 'overview' },
        { name: 'Sales summary', icon: 'mdi-sale', path: 'salessammary' },
        { name: 'Items Sold', icon: 'mdi-cart', path: 'itemwisesale' },
        { name: 'Find A Bill', icon: 'mdi-magnify', path: 'findbill' },
        // { name: 'Menu Categories', icon: 'mdi-book-open-page-variant', path: 'menu_categories' },
        // { name: 'Menu Items', icon: 'mdi-book-open-variant', path: 'menu_items' },
        { name: 'Discounts', icon: 'mdi-bell-check', path: 'discounts_report' },
        { name: 'Item Cancellations', icon: 'mdi-cancel', path: 'cancellations_report' },
        { name: 'NC Reports', icon: 'mdi-all-inclusive', path: 'nc_report' },
      ],
    };
  },
  computed: {
    companyInfo() {
      return this.user ? this.user.company_info : null;
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';
    .panel-sales {
        width: 100%;
        min-height: 100%;
        display: inline-flex;
        flex-direction: column;
        font-family: $font-style;
        font-size: 1em;
        line-height: 1.5;
        overflow: hidden!important;
        background-color: inherit;

        .panel-item {
            color: $grey;
            box-shadow: $shadow;
            font-family: inherit;
            display: flex;
            flex-direction: column;
            gap: 10px;

            h6 {
                color: $black;
                padding: 5px;
                font-weight: bold;
                font-size: 16px;
                line-height: 1.5!important;
            }

            .days-left {
                color: $red;
            }

            .total-sale {
                font-size: 16px;
                line-height: 1.5;
                padding: 10px;
                font-weight: 300;
                border-bottom: 0.5px solid $light-grey;
                color: $white!important;
                background-color: $dark-grey;
                font-weight: bold;
            }

            .view-sales-btn {
                padding: 10px;
            }
        }

        .pending {
            min-height: 150px;
            border: 1px solid $light-grey;
            padding-top: 5px;

            .header {
                background-color: $dark-grey;
                padding: 10px;
                color: $white;
                text-align: left;
                font-weight: bold;
            }
        }
    }
</style>
