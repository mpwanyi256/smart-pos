<template>
    <div class="packages_list">
        <template v-if="loading">
            <div class="loading_spinner">
                <LoadingSpinner class="large" />
            </div>
        </template>
        <template v-else>
        <div class="header_section">
            <p>
                <v-btn icon left dark @click="$emit('previous')">
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                Please Select package to continue
            </p>
        </div>
        <div class="listing">
            <div class="package"
                v-for="pkg in packages"
                :key="pkg.id"
                @click="selectedPackage = pkg.id"
                :class="selectedPackage == pkg.id ? 'selected' : ''"
            >
                <h3>{{ pkg.name }}
                    <span class="float-right">${{ pkg.amount }} Per Month</span>
                </h3>
                <p class="gre--text">{{ pkg.description }}</p>
            </div>
        </div>
        <div class="continue_div text-center red--text">
            {{ errorMessage }}
        </div>
        <div class="continue_div">
            <v-btn block class="primary"
                :disabled="!selectedPackage != 0"
                @click="continueToAccount"
            >
                Continue to account
            </v-btn>
        </div>
        </template>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';
import LoadingSpinner from '@/components/generics/LoadingSpinner.vue';
import idb from '@/mixins/idb';

export default {
  name: 'SelectPackage',
  components: {
    LoadingSpinner,
  },
  data() {
    return {
      selectedPackage: 0,
      loading: true,
      idb_key: 'smart_business_info',
      companyInfo: null,
      errorMessage: '',
    };
  },
  computed: {
    ...mapGetters('auth', ['packages']),

    routeOn() {
      return this.$route.name;
    },

    dayToday() {
      return moment().format('Y-mm-D');
    },
  },
  async created() {
    await this.getPackages();
    await this.getDataSync();
    this.loading = false;
  },
  methods: {
    ...mapActions('auth', ['getPackages',
      'addCompanyFirebase', 'getUserById', 'post', 'performLogin']),
    ...mapActions('mail', ['sendEmail']),

    async getDataSync() {
      this.companyInfo = await idb.get(this.idb_key).catch(() => null);
    },

    async continueToAccount() {
      this.errorMessage = '';
      this.loading = true;
      const company = {
        company_name: this.companyInfo.name,
        company_location: this.companyInfo.address,
        company_mobile: this.companyInfo.contact,
        email_address: this.companyInfo.email,
        business_type: this.companyInfo.business_type,
        package: this.selectedPackage,
        password: this.companyInfo.password,
        create_new_company: this.companyInfo.name,
      };

      this.post(company)
        .then(async (newAccount) => {
          if (newAccount.error) {
            this.errorMessage = newAccount.message;
          } else {
            await idb.delete(this.idb_key);
            await idb.delete('smart_auth');

            const authParams = {
              user_id: newAccount.user_id,
              new_account: 'new account',
            };

            this.$nextTick(() => {
            // Send Verification Code
              this.sendEmail({
                send_verification_code: true,
                company_name: company.company_name,
                company_email: company.email_address,
                company_id: newAccount.company_id,
              })
                .then(() => {
                  this.$router.replace({
                    name: 'verification',
                    params: authParams,
                  });
                })
                .catch((e) => console.log('error', e))
                .finally(() => {
                  this.loading = false;
                });
            });
          }
        })
        .catch((e) => {
          this.errorMessage = e;
        })
        .finally(() => {
          this.loading = false;
        });

      // const fbAccount = {
      //   DayOpen: this.dayToday,
      //   DaysLeft: 3,
      //   Email: this.companyInfo.email,
      //   HomeServer: '127.0.0.1',
      //   LiveUrl: `${this.companyInfo.email}_Live`,
      //   Location: this.companyInfo.address,
      //   Name: this.companyInfo.name,
      //   TimeZone: 'Africa/Kampala',
      //   package: this.selectedPackage,
      // };

      // const fbAcc = await this.addCompanyFirebase(fbAccount);
      // if (fbAcc && !fbAcc.error) {
      //   const newAccount = await this.post(company).catch(() => null);
      //   console.log('newAccount', newAccount);
      //   if (newAccount && !newAccount.error) {
      //     await idb.delete(this.idb_key);
      //     await idb.delete('smart_auth');
      //     const newAccountId = newAccount.user_id;
      //     localStorage.setItem('smart_user_id', newAccountId);
      //     await this.getUserById('new account');
      //   } else {
      //     this.errorMessage = newAccount.message;
      //   }
      // } else {
      //   this.errorMessage = fbAcc.message;
      //   console.log(fbAcc.message);
      // }
      this.loading = false;
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

.packages_list {
    display: flex;
    flex-direction: column;
    // gap: 10px;
    min-height: 300px;

    .loading_spinner {
        height: 300px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .header_section {
        min-height: 50px;
        display: inline-flex;
        width: 100%;
        justify-content: left;
        align-items: center;
        background-color: #204a63;
        color: $white;
        font-size: 18px;
        padding-top: 16px;
    }

    .listing {
        display: flex;
        flex-direction: column;
        max-height: 300px;
        overflow-y: auto;

        .selected, .selected:hover {
            background-color: $blue !important;
            color: $white !important;
        }

        > div {
            min-height: 56px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: left;
            border-bottom: 0.5px solid $border-color;
            cursor: pointer;
            padding: 16px;
        }

        .package:hover {
            background-color: $lighter-blue;
        }
    }

    .continue_div {
        padding: 16px;
        margin-top: 10px;
    }
}

</style>
