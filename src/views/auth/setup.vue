<template>
    <div class="main-login">
        <v-container>
            <v-row>
                <v-col cols="12" xs="12" sm="10" offset-sm="1" md="6" offset-md="3"
                lg="6" offset-lg="3" xl="6" offset-xl="3">
                    <v-card max-width="auto">
                        <v-form @submit.prevent="setIPaddress" class="mt-3">
                        <v-card-text>
                            <div class="text-center mb-3">
                                <h4>Smart Client POS</h4>
                                <p class="grey--text mt-2">Setup server IP Address</p>
                            </div>
                            <v-text-field v-model.trim="ipAddress" label="Enter IP Address" />
                            <v-btn type="submit" block class="btn-login">Set UP</v-btn>
                            <p @click="goToLogin" class="login_instead">login instead</p>
                        </v-card-text>
                        </v-form>
                        <BaseAlert v-if="error.status" :message="error.message" />
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import BaseAlert from '@/components/alerts/BaseAlert.vue';
import axios from 'axios';

export default {
  name: 'IpSetup',

  components: {
    BaseAlert,
  },

  data() {
    return {
      ipAddress: '',
    };
  },

  computed: {
    ...mapGetters('auth', ['error']),
  },

  methods: {
    ...mapActions('auth', ['setError']),

    goToLogin() {
      this.$router.replace({ name: 'login' });
    },

    setIPaddress() {
      axios.defaults.baseURL = `${this.ipAddress}/papi/`;
      localStorage.setItem('smartpos_ipaddress_set', this.ipAddress);
      this.$router.replace({ name: 'login' });
    },

  },

};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

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
    background-image: url('../../assets/rocket.jpeg');
    background-size: 100%;
    background-repeat: no-repeat;
  }

  .login_instead {
    color: $accent;
    margin-top: 16px;
    text-align: right;
    font-size: 16px;
    cursor: pointer;
  }
</style>
