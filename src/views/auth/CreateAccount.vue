<template>
    <div class="create_account">
        <template v-if="loading">
            <div class="loading_spinner">
                <LoadingSpinner class="large" />
            </div>
        </template>
            <template v-else>
            <div class="header_section">Create account</div>
            <div class="company_info">
                <div class="frm_input">
                    <label>Company name</label>
                    <BaseTextfield :preset="name" v-model="name" placeholder="Company name" />
                </div>
                <div class="frm_input">
                    <label>Address</label>
                    <BaseTextfield :preset="address"
                    v-model="address" placeholder="Company address" />
                </div>
                <div class="frm_input">
                    <label>Email address</label>
                    <BaseTextfield :preset="email" v-model="email" placeholder="Email address" />
                </div>
                <div class="frm_input">
                    <label>Contact number</label>
                    <BaseTextfield :preset="contact"
                    v-model="contact" placeholder="Contact number" />
                </div>
                <div class="frm_input">
                    <label>Business type</label>
                    <v-select
                        outlined
                        dense
                        :items="businessTypes"
                        item-text="name"
                        item-value="id"
                        v-model="businessType"
                    />
                </div>
                <div class="frm_input">
                    <label>Create password</label>
                    <BaseTextfield :preset="password"
                    v-model="password" inputType="password" placeholder="password" />
                </div>
            </div>
            <div class="create_account_btn pl-5 pr-5">
                <v-btn class="primary" block
                    @click="createAccount"
                >
                    <v-icon left>mdi-arrow-right</v-icon>
                    Next
                </v-btn>
            </div>
            <div class="login_link">
              <p>
                <span @click="switchToLogin">Signin</span> |
                <span @click="verifyCompany">Proceed to Activate company</span>
              </p>
            </div>
        </template>
    </div>
</template>
<script>
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import LoadingSpinner from '@/components/generics/LoadingSpinner.vue';
import idb from '@/mixins/idb';

export default {
  name: 'CreateAccount',
  components: {
    BaseTextfield,
    LoadingSpinner,
  },
  data() {
    return {
      businessTypes: [
        { id: 1, name: 'Bar & Restaurant' },
        { id: 2, name: 'Small/Medium size business' },
        { id: 3, name: 'Real estate company' },
      ],
      name: '',
      address: '',
      email: '',
      contact: '',
      businessType: '',
      password: '',
      idb_key: 'smart_business_info',
      loading: false,
    };
  },
  computed: {
    business() {
      return {
        name: this.name,
        address: this.address,
        email: this.email,
        contact: this.contact,
        business_type: this.businessType,
        password: this.password,
        data_key: this.idb_key,
      };
    },
  },
  watch: {
    business: {
      async handler() {
        await this.syncData();
      },
      deep: true,
    },
  },
  created() {
    this.$nextTick(async () => {
      await this.getDataSync();
    });
  },
  methods: {

    verifyCompany() {
      this.$router.push({ name: 'verification' });
    },

    async getDataSync() {
      try {
        const data = await idb.get(this.idb_key).catch(() => null);
        if (data) {
          this.name = data.name;
          this.address = data.address;
          this.email = data.email;
          this.contact = data.contact;
          this.businessType = data.business_type;
          this.password = data.password;
        }
      } catch (e) {
        console.log('idb error', e);
      } finally {
        this.loading = false;
      }
    },

    async syncData() {
      await idb.add(this.business)
        .catch(() => { idb.update(this.business); });
    },
    switchToLogin() {
      this.$emit('login');
    },
    createAccount() {
      this.$emit('next');
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

.create_account {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 300px;

    .loading_spinner {
        height: 300px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .header_section {
        height: 50px;
        display: inline-flex;
        width: 100%;
        justify-content: center;
        align-items: center;
        background-color: #204a63;
        color: $white;
        font-size: 18px;
    }

    .company_info {
        display: grid;
        grid-template-columns: 48% 48%;
        gap: 15px;
        padding: 5px;

        > div {
            display: flex;
            flex-direction: column;
            gap: 5px;
            margin-bottom: 10px;
            font-size: 14px;
        }
    }

    .login_link {
        width: 100%;
        margin-top: 15px;
        display: inline-flex;
        align-items: center;

        p {
        font-size: 14px;
        color: $black;
        text-align: center;
        width: 100%;
        line-height: 1.5;

        span {
            color: $accent;
            cursor: pointer;
        }
        }
    }
}

</style>
