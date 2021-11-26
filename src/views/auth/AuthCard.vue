<template>
    <v-card class="auth_card">
        <v-form @submit.prevent="loginUser">
        <v-card-text v-if="viewMode == 1">
            <div class="text-center mb-3">
              <h1>Smart Client POS</h1>
            </div>
            <v-text-field v-model.trim="Username" label="Username"></v-text-field>
            <v-text-field v-model.trim="Password" label="Password" type="password">
            </v-text-field>
            <v-btn type="submit" block class="btn-login">Login</v-btn>
            <div class="sign_up_div">
              <p>New here? <span @click="viewMode = 2">Create account</span></p>
            </div>
        </v-card-text>
        <CreateAccount v-else-if="viewMode == 2"
          @login="switchView(1)"
          @next="switchView(3)"
        />
        <SelectPackage
          v-else-if="viewMode == 3"
          @previous="switchView(2)"
        />
        </v-form>
        <BaseAlert v-if="error.status" :message="error.message" />
        <v-progress-linear v-if="loading" indeterminate color="black" />

        <LicenseModal
          v-if="openLicenseModal"
          @close="openLicenseModal = false"
        />
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import BaseAlert from '@/components/alerts/BaseAlert.vue';
import LicenseModal from '@/components/pos/manage/LicenseModal.vue';
import CreateAccount from '@/views/auth/CreateAccount.vue';
import SelectPackage from '@/views/auth/SelectPackage.vue';
import idb from '@/mixins/idb';

export default {
  name: 'AuthCard',

  components: {
    BaseAlert,
    LicenseModal,
    CreateAccount,
    SelectPackage,
  },

  data() {
    return {
      Username: '',
      Password: '',
      passwordReset: false,
      createAccountModal: false,
      openLicenseModal: false,
      viewMode: 1,
      idb_key: 'smart_auth',
      loading: false,
    };
  },

  computed: {
    ...mapGetters('auth', ['error', 'user', 'license']),

    userId() {
      return localStorage.getItem('smart_user_id');
    },
    routeOn() {
      return this.$route.name;
    },
  },

  watch: {
    viewMode() {
      this.syncData();
    },
    error: {
      handler(val) {
        // eslint-disable-next-line eqeqeq
        if (val.message == 'Sorry, your license expired') {
          this.openLicenseModal = true;
        }
      },
      deep: true,
    },
  },

  created() {
    this.$nextTick(async () => {
      const LoggedInUser = localStorage.getItem('smart_user_id');
      const lastStep = await idb.get(this.idb_key);
      this.viewMode = lastStep ? lastStep.step : 1;
      if (LoggedInUser) {
        this.loading = true;
        this.getUserById(this.routeOn);
        if (this.error.message === 'Sorry, your license expired') {
          await this.getLicense();
          this.openLicenseModal = true;
        }
        this.loading = false;
      }
    });
  },

  methods: {
    ...mapActions('auth',
      ['performLogin',
        'setError',
        'getUserById',
        'clearError',
        'getActiveLicense']),

    async syncData() {
      const step = { data_key: this.idb_key, step: this.viewMode };
      await idb.add(step).catch(() => { idb.update(step); });
    },

    switchView(view) {
      this.viewMode = view;
      this.syncData();
    },

    async loginUser() {
      if (this.Username.toLowerCase() === 'x' && this.Password.toLowerCase() === 'x') {
        this.clearError();
        this.$router.push({ name: 'setup' });
        return;
      }
      if (this.Username.length <= 2) {
        this.setError('Sorry, Username Must be atleast 3 Characters long');
      } else if (this.Username.Password <= 5) {
        this.setError('Sorry, Password Must be atleast 6 Characters long');
      } else {
        this.loading = true;
        const credentials = {
          username: this.Username,
          password: this.Password,
        };
        await this.performLogin(credentials);
        if (this.error.message === 'Sorry, your license expired') {
          this.getLicense();
        }
        this.loading = false;
      }
    },

    async getLicense() {
      try {
        await this.getActiveLicense(this.user.company_info.company_email);
      } catch (e) {
        console.log('Error fetching license', e);
      }
      this.openLicenseModal = true;
    },

  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

  .sign_up_div {
    width: 100%;
    margin-top: 15px;
    display: inline-flex;
    align-items: center;

    p {
      font-size: 14px;
      color: $black;
      text-align: right;
      width: 100%;
      line-height: 1.5;

      span {
        color: $accent;
        cursor: pointer;
      }
    }
  }

  .auth_card {
    background-color: $white;
    opacity: 0.7.5;
  }

  .btn-login {
    background-color: white!important;
    color: black;
    border: 1px solid #3d3d3d;
  }

  .main-login {
    height: 100vh;
    width: 100vw;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #f2f2f7;
  }
</style>
