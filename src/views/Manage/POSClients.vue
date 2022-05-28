<template>
    <div class="client_list">
        <Table>
            <template slot="header">
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Day Open</th>
                    <th>Days Left</th>
                    <th>License</th>
                    <th>Manage</th>
                </tr>
            </template>
            <template slot="body">
                <tr v-for="(Client, i) in clients" :key="Client.id">
                    <td>{{ i+1 }}</td>
                    <td>{{ Client.Name }}</td>
                    <td>{{ Client.Email }}</td>
                    <td>{{ Client.Location }}</td>
                    <td>{{ Client.DayOpen }}</td>
                    <td>{{ Client.DaysLeft }}</td>
                    <td>
                        <v-btn x-small fab @click="generateLicense(Client)">
                            <v-icon>mdi-license</v-icon>
                        </v-btn>
                    </td>
                    <td>
                        <v-btn x-small fab>
                            <v-icon>mdi-security</v-icon>
                        </v-btn>
                    </td>
                </tr>
            </template>
        </Table>
        <CreateLicenseKey
            v-if="openLicenseGen && selectedClient"
            :client="selectedClient"
            @close="openLicenseGen = false"
        />
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import firebase from 'firebase/app';
import Table from '@/components/generics/new/Table.vue';
import CreateLicenseKey from '@/components/manage/CreateLicenseKey.vue';

export default {
  name: 'POSClients',
  components: {
    Table,
    CreateLicenseKey,
  },
  data() {
    return {
      openLicenseGen: false,
      selectedClient: null,
    };
  },
  computed: {
    ...mapGetters('manage', ['clients']),
  },
  async created() {
    await this.fetchClients();
    await this.fetchClientLicenses();
    firebase.firestore().collection('Companies')
      .onSnapshot(async () => {
        await this.fetchClients();
      });
  },
  methods: {
    ...mapActions('manage', ['fetchClients', 'fetchClientLicenses']),

    generateLicense(client) {
      this.selectedClient = client;
      this.openLicenseGen = true;
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.client_list {
    height: calc(100vh - 52px);
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    color: $black;
    background-color: $white;
  }
</style>
