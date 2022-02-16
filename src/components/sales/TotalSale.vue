<template>
    <div class="panel-item">
        <template v-if="companyInfo">
            <div class="total-sale">
                {{ companyInfo.company_name }}
            </div>
            <div class="sale-value display-1 text-center">
                {{ `${sale ? sale : 0} ${companyInfo.company_currency}` }}
            </div>
            <h6 class="text-center" @click="showReport = true">
                <v-icon small color="black">mdi-calendar</v-icon>
                {{ companyInfo.day_open_display }}
            </h6>
            <h6 :class="companyInfo.days_left > 10 ? 'days-okay' : 'days-left'" class="text-center">
                {{ `${companyInfo.days_left }`}} Days left
            </h6>
        </template>
        <SalesReport
            v-if="showReport"
            @close="showReport = false"
            :date="companyInfo.day_open"
        />
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import SalesReport from '@/components/Reports/SalesReport.vue';

export default {
  name: 'TotalSale',
  components: {
    SalesReport,
  },
  data() {
    return {
      showReport: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('sales', ['sale']),
    companyInfo() {
      return this.user ? this.user.company_info : null;
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';
    .panel-sales {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        font-family: $font-style;
        font-size: 1em;
        line-height: 1.5;
        overflow: auto;

        .panel-item {
            height: auto;
            background-color: inherit;
            color: $grey;
            box-shadow: $shadow;
            font-family: inherit;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding-bottom: 5px;
            border: 0.5px solid $light-grey;

            h6 {
                color: $black;
                padding: 5px;
                font-weight: bold;
                font-size: 16px;
                line-height: 1.5!important;

                .options {
                    width: 100%;
                    padding-right: 5px;
                    display: inline-flex;
                    flex-direction: row;
                    gap: 5px;
                    margin-top: 5px;
                    > div {
                        width: 100%;
                    }
                    // grid-template-columns: 50% 50%;
                    // margin-top: 10px;
                }
            }

            .days-left {
                color: $red;
            }

            .days-okay {
                color: green;
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
