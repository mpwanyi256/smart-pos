<template>
    <Basemodal
      :title="`${client.Name} licenses`"
      :size="1020" @close="$emit('close')">
        <div class="client_licenses">
          <LinearLoader v-if="loading" />
            <div class="new_license_card">
                <div class="license_key">
                    Key: {{ licenseKey }}
                    <p class="small red--text">
                        {{ error }}
                    </p>
                </div>
                <div>
                    <BaseTextfield v-model="duration" placeholder="Days" inputType="number" />
                </div>
                <div>
                    <v-btn fab small @click="generateKey">
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </div>
                <div>
                    <v-btn fab small @click="uploadKey">
                        <v-icon>mdi-upload</v-icon>
                    </v-btn>
                </div>
            </div>
          <div class="licenses_list">
              <Table>
                <template slot="header">
                    <tr>
                        <th>Key</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>&nbsp;</th>
                    </tr>
                </template>
                <template slot="body">
                <tr v-for="License in clientLicenses" :key="License.id">
                    <td>{{ License.key }}</td>
                    <td>{{ License.duration }}</td>
                    <td>{{ licenseStatus(License.status) }}</td>
                    <td>
                      <v-btn icon small @click="deleteLicense(License)" >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </td>
                </tr>
                </template>
              </Table>
          </div>
        </div>
    </Basemodal>
</template>
<script>
import moment from 'moment';
import { mapActions, mapGetters } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import Table from '@/components/generics/new/Table.vue';
import LinearLoader from '@/components/generics/Loading.vue';

export default {
  name: 'CreateLicenseKey',
  props: {
    client: {
      type: Object,
      required: true,
    },
  },
  components: {
    Basemodal,
    BaseTextfield,
    Table,
    LinearLoader,
  },
  data() {
    return {
      licenseKey: '',
      duration: 30,
    };
  },
  computed: {
    ...mapGetters('manage', ['licenses', 'error', 'loading']),

    clientLicenses() {
      return this.licenses.filter((Lic) => Lic.company === this.client.Email);
    },

    dayMonth() {
      return moment(new Date()).format('MMMYY');
    },
  },
  created() {
    this.generateKey();
  },
  methods: {
    ...mapActions('manage', ['performAddLicense', 'deleteKey', 'fetchClientLicenses']),

    licenseStatus(status) {
      return status === 1 ? 'Activated' : 'Pending';
    },

    async deleteLicense(license) {
      await this.deleteKey(license.id);
      await this.fetchClientLicenses();
    },

    async uploadKey() {
      const newKey = {
        key: this.licenseKey,
        duration: this.duration,
        status: 0,
        company: this.client.Email,
      };
      if (!Object.values(newKey).includes(null || undefined || '')) {
        await this.performAddLicense(newKey);
        this.licenseKey = '';
      }
    },

    generateKey() {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 25; i++) {
        result += characters.charAt(Math.floor(Math.random()
 * charactersLength));
      }
      this.licenseKey = `${this.client.Name.split(' ')[0]}${this.dayMonth}${result}`;
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.client_licenses {
  height: 500px;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;

  .new_license_card {
    height: 50px;
    width: 100%;
    border: 1px solid $border-color;
    border-radius: 5px;
    display: grid;
    grid-template-columns: 50% 20% 15% 15%;
    justify-content: center;
    align-items: center;

    >div {
        width: 100%;
        display: inline-flex;
        justify-content: center;
        align-items: center;
    }
    >div:first-child {
        padding-left: 10px;
        font-size: 16px;
        color: $black;
        font-weight: bold;
        justify-content: left;
    }
  }

  .licenses_list {
    max-height: calc(500px - 50px);
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>
