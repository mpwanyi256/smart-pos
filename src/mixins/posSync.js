export default {
  name: 'posSync',

  methods: {
    performPOSsync() {
      // Sync POS with Indexed Database
      this.$eventBus.$emit('show-snackbar', 'Syncing POS...');
    },
  },
};
