<template>
    <div class="company_settings">
        <div class="settings_pane">
         <div class="entries">
             <div class="entry_form">
                <div>
                    <p>Company name</p>
                    <BaseTextfield
                        :preset="name"
                        v-model="name"
                        placeholder="Company name"
                    />
                </div>
                <div>
                    <p>Company address</p>
                    <BaseTextfield
                        :preset="address"
                        v-model="address"
                        placeholder="address"
                    />
                </div>
                <div>
                    <p>Tin number</p>
                    <BaseTextfield
                        :preset="tin"
                        v-model="tin"
                        placeholder="tin"
                    />
                </div>
                <div>
                    <p>Contact number</p>
                    <BaseTextfield
                        :preset="contact"
                        v-model="contact"
                        placeholder="Contact number"
                    />
                </div>
                <div>
                    <p>Account Email Address</p>
                    <p class="grey--text darken-3">
                      {{ email }}
                    </p>
                </div>
                <div>
                    <p>Receipt foot note</p>
                    <BaseTextfield
                        :preset="receipt"
                        v-model="receipt"
                        placeholder="Receipt note"
                    />
                </div>
                <div>
                    &nbsp;
                </div>
                <div>
                    <BaseAlert v-if="message" type="success" message="Success" />
                    <div>
                    <v-btn
                        @click="updateCompanyInfo"
                        class="float-right blue"
                        dark
                    >
                    <!-- <v-icon left>mdi-info</v-icon> -->
                    Update info</v-btn>
                    </div>
                </div>

            </div>
         </div>
        <div class="actions">
        </div>
        </div>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import BaseAlert from '@/components/generics/new/BaseAlert.vue';

export default {
  name: 'CompanySettings',
  components: {
    BaseTextfield,
    BaseAlert,
  },
  data() {
    return {
      name: '',
      address: '',
      tin: '',
      email: '',
      contact: '',
      receipt: '',
      message: '',
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),

    company() {
      return this.user.company_info;
    },
  },
  watch: {
    message() {
      setTimeout(() => {
        this.message = '';
      }, 3000);
    },
  },
  created() {
    this.setDefaults();
  },
  methods: {
    ...mapActions('auth', ['getUserById']),
    ...mapActions('settings', ['post']),

    setDefaults() {
      this.name = this.company.company_name;
      this.address = this.company.company_location;
      this.tin = this.company.company_tin;
      this.contact = this.company.company_mobile;
      this.email = this.company.company_email;
      this.receipt = this.company.company_receipt;
    },

    updateCompanyInfo() {
      const filters = {
        name: this.name,
        address: this.address,
        tin: this.tin,
        mobile: this.contact,
        email: this.email,
        receipt: this.receipt,
        update_company_info: this.company.company_id,
      };

      this.post(filters)
        .then((res) => {
          if (res.error) this.message = res.error_message;
          else this.message = 'Success';
          this.getUserById();
        });

      console.log('update', filters);
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.company_settings {
    height: calc(100vh - 52px);
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    color: $black;
    padding: 15px;

    .settings_pane {
        min-height: 550px;
        width: 100%;
        margin: auto;
        padding: 25px;
        border: 1px solid $border-color;
        border-radius: 5px;
        box-shadow: $elevation-low;

        .entries {
            height: 550px;
            overflow-y: auto;
            overflow-x: hidden;
            margin-bottom: 15px;

            .entry_form {
                display: grid;
                grid-template-columns: 45% 45%;
                gap: 15px;

                >div {
                    height: 100px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    padding-right: 10px;
                    color: $black;
                    justify-content: center;
                }
            }
        }
    }
}
</style>
