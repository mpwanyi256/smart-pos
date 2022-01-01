import firebase from 'firebase/app';

export default {
  namespaced: true,
  state: {
    clients: [],
    licenses: [],
    loading: false,
    error: '',
  },
  mutations: {
    SetError(state, message) {
      state.error = message;
    },
    toggleLoading(state, loadState) {
      state.loading = loadState;
    },
    setCompanies(state, companies) {
      state.clients = companies;
    },
    setLicenses(state, licenses) {
      state.licenses = licenses;
    },
  },
  actions: {
    async deleteKey({ commit }, licenseKey) {
      commit('toggleLoading', true);
      await firebase.firestore().collection('licenses')
        .doc(licenseKey).delete();
      commit('toggleLoading', false);
    },
    performAddLicense({ commit }, license) {
      commit('toggleLoading', true);
      const DB = firebase.firestore().collection('licenses');
      const addKey = () => {
        DB.add(license)
          .catch((e) => {
            console.log('fb add error', e);
          });
      };

      DB.where('key', '==', license.key)
        .where('company', '==', license.company)
        .get()
        .then((snapshots) => {
          if (snapshots.size === 0) {
            addKey();
          } else {
            commit('SetError', 'Key already exists');
          }
        });
      commit('toggleLoading', false);
    },
    fetchClientLicenses({ commit }) {
      const licensesArr = [];
      firebase.firestore().collection('licenses')
        .orderBy('status', 'asc')
        .get()
        .then((snapshots) => {
          if (!snapshots.empty) {
            snapshots.forEach((License) => {
              licensesArr.push({ id: License.id, ...License.data() });
            });
            commit('setLicenses', licensesArr);
          }
        })
        .catch((e) => {
          console.log('Firebase error', e);
        });
    },
    async fetchClients({ commit }) {
      const COMPANIES = firebase.firestore().collection('Companies');
      const companiesArr = [];

      COMPANIES
        .orderBy('Name', 'asc')
        .get()
        .then((snapshots) => {
          if (!snapshots.empty) {
            snapshots.forEach((company) => {
              companiesArr.push({ id: company.id, ...company.data() });
            });
          }
        })
        .catch((e) => {
          console.log('Firebase error', e);
        });
      commit('setCompanies', companiesArr);
    },
  },
  getters: {
    clients: (state) => state.clients,
    licenses: (state) => state.licenses,
    error: (state) => state.error,
  },
};
