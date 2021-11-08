<template>
  <v-app>
    <router-view></router-view>
    <v-snackbar
      v-model="snackbar" top
    >
      {{ snackMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'App',
  data() {
    return {
      polling: null,
      snackMessage: '',
      snackbar: false,
      loading: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['user', 'company']),
  },
  watch: {
    async user(val) {
      if (val && val.company_id) {
        this.loadHomeDefaults();
      }
    },
  },
  async created() {
    if (this.user && this.user.company_info) {
      this.loadHomeDefaults();
    }
  },
  beforeDestroy() {
    // clearInterval(this.polling);
    // this.polling = null;
  },

  eventBusCallbacks: {
    'show-snackbar': 'showSnackBar',
  },

  methods: {
    ...mapActions('auth', ['getDayOpen', 'getActiveLicense', 'getFirebaseInfo']),
    ...mapActions('settings', ['fetchOutletSettings']),
    ...mapMutations('settings', ['setColtrols']),

    async loadHomeDefaults() {
      await this.getAccessControls();
      await this.getDayOpen(this.user.company_id);
      await this.getActiveLicense(this.user.company_info.company_email);
      await this.getFirebaseInfo();
    },

    async getAccessControls() {
      this.loading = true;
      const OUTLET = localStorage.getItem('smart_outlet_id');
      const controls = await this.fetchOutletSettings(
        { get_access_controls: 'all', outlet: OUTLET },
      );
      if (!controls.error) this.setColtrols(controls.data);
      this.loading = false;
    },

    showSnackBar(message) {
      this.snackMessage = message;
      this.snackbar = true;
    },

    togglePolling() {
      const setPolling = () => {
        if (!this.user) {
          clearInterval(this.polling);
        } else {
          this.getDayOpen(this.user.company_id);
        }
      };
      this.polling = setInterval(() => {
        setPolling();
      }, 3000);
    },
  },
};
</script>
<style scoped lang="scss">
@import 'styles/main.scss';
</style>
