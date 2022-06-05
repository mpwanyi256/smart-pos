<template>
    <div class="access_conrols">
        <Table>
            <template slot="header">
                <tr>
                    <th>
                      <div class="search_field">
                        <BaseTextfield v-model="search" placeholder="Search ..." />
                        <v-select small-chips outlined dense
                          :items="outlets"
                          item-text="name"
                          item-value="id"
                          label="Outlet"
                          v-model="selectedOutlet"
                        />
                      </div>
                    </th>
                    <th>STATUS</th>
                </tr>
            </template>
            <template slot="body">
                <tr v-for="(setting, i) in filteredControls" :key="i">
                    <td>
                      <p>
                        <strong>
                          {{ setting.title }}
                        </strong>
                      </p>
                      <div class="setting_description" v-html="setting.description" />
                    </td>
                    <td>
                      <template v-if="setting.type == 1">
                      <v-btn
                        @click="toggleAction(!setting.status, setting)"
                        :disabled="loading"
                        :color="setting.status ? 'green' : 'red'"
                        dark
                      >
                        {{ setting.status ? 'YES' : 'NO' }}
                      </v-btn>
                      </template>
                      <template v-else>
                        <SettingUpdate :setting="setting" @update="updateSettingCount" />
                      </template>
                    </td>
                </tr>
            </template>
        </Table>
    </div>
</template>
<script>
import { mapActions, mapMutations } from 'vuex';
import Table from '@/components/generics/new/Table.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import SettingUpdate from './SettingUpdate.vue';

export default {
  name: 'AccessControls',
  components: {
    Table,
    BaseTextfield,
    SettingUpdate,
  },
  data() {
    return {
      search: '',
      loading: false,
      outlets: [],
      selectedOutlet: null,
      accessControls: [],
    };
  },
  computed: {

    filteredControls() {
      return this.accessControls.filter((Setting) => Setting.description.toLowerCase()
        .includes(this.search.toLowerCase()));
    },
  },
  async created() {
    await this.getOutlets();
  },
  watch: {
    selectedOutlet: {
      handler(outlet) {
        if (outlet) this.getAccessControls();
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('settings', ['fetch', 'post', 'fetchOutletSettings']),
    ...mapMutations('settings', ['setColtrols']),

    async getOutlets() {
      const OUTLETS = await this.post({ fetch_company_outlets: 'all' }).catch(() => null);
      if (OUTLETS) this.outlets = OUTLETS.data;
      // eslint-disable-next-line prefer-destructuring
      this.selectedOutlet = this.outlets[0].id;
    },

    async getAccessControls() {
      this.loading = true;
      const controls = await this.fetchOutletSettings(
        { get_access_controls: 'all', outlet: this.selectedOutlet },
      );
      if (!controls.error) this.accessControls = controls.data;
      this.setColtrols(controls.data);
      this.loading = false;
    },

    async triggerSettingUpdate(payload) {
      this.post(payload)
        .then(async () => {
          await this.getAccessControls();
        })
        .catch((e) => {
          console.log('Error in toggling action', e);
        }).finally(() => {
          this.loading = false;
        });
    },

    updateSettingCount(payload) {
      const { setting, value } = payload;
      this.triggerSettingUpdate({
        update_access_setting: setting.outlet_access_id,
        setting_id: setting.id,
        outlet_id: this.selectedOutlet,
        status: value,
      });
    },

    async toggleAction(status, setting) {
      this.loading = true;
      this.triggerSettingUpdate({
        update_access_setting: setting.outlet_access_id,
        setting_id: setting.id,
        outlet_id: this.selectedOutlet,
        status: status ? 'YES' : 'NO',
      });
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.access_conrols {
  height: calc(100vh - 52px);
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: $black;
}

.description {
  padding-right: 5px;
}

.search_field {
  max-width: 350px;
  top: 0;
  bottom: 0;
  margin: 0;
  padding: 0 !important;
  display: inline-flex;
  gap: 16px;
}

.setting_description {
  display:block;
  max-width: 550px;
  word-wrap:break-word;
  white-space: normal;
  color: $grey;
}
</style>
