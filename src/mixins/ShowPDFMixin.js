export default {
  name: 'ShowPDFMixin',

  computed: {
    serverIP() {
      const IPAddress = localStorage.getItem('smartpos_ipaddress_set');
      return IPAddress ? `${IPAddress}/papi/` : 'http://localhost:80/papi/';
    },
  },

  methods: {
    openPDF(url) {
      try {
        const SERVERURL = `${this.serverIP}pdf/${url}`;
        window.open(SERVERURL, '_blank').focus();
      } catch (e) {
        console.log('Error opening pdf window', e);
      }
    },
  },
};
