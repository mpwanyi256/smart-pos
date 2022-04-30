<template>
  <Basemodal
    :title="`Create new user account`"
    :size="700" @close="$emit('close')">
    <div class="create_user">
      <v-text-field
        outlined dense
        v-model.trim="firstName"
        label="First name"
      />
      <v-text-field
        outlined dense
        v-model.trim="lastName"
        label="Last name"
      />
      <v-text-field
        outlined dense
        v-model.trim="fullname"
        label="Email address"
      />
      <v-select outlined
        dense
        v-model="employeeOutletId"
        :items="outlets"
        item-value="id"
        item-text="name"
        label="Outlet / branch"
        class="mt-3"
      />
      <v-select outlined
        dense label="User role"
        v-model="role"
        :items="roles"
        item-value="id"
        item-text="name"
      />
      <v-text-field
        outlined dense
        v-model.trim="password"
        label="password"
        type="password"
      />
      <v-text-field
        outlined dense
        v-model.trim="passwordConfirm"
        label="confirm password"
        type="password"
      />
      <div class="options">
        <v-spacer></v-spacer>
          <v-btn
              :disabled="!isValidPassword"
              @click="createUserHandler"
              class="ml-1">
              Create user account
          </v-btn>
      </div>
    </div>
  </Basemodal>
</template>
<script>
import moment from 'moment';
import validator from 'validator';
import { mapActions, mapGetters } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';

export default {
  name: 'CreateUserModal',
  components: {
    Basemodal,
  },
  data() {
    return {
      roles: [],
      firstName: '',
      lastName: '',
      fullname: '',
      role: 1,
      password: '',
      passwordConfirm: '',
      outlets: [],
      employeeOutletId: 0,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),

    isValidEmail() {
      return validator.isEmail(this.fullname);
    },

    isValidPassword() {
      return this.isValidEmail && this.password.length > 3
      && this.firstName.length > 2 && this.lastName.length > 2
      && (this.password === this.passwordConfirm && this.employeeOutletId !== 0);
    },
  },
  async created() {
    await this.fetchDbRoles();
    await this.getOutlets();
  },
  methods: {
    ...mapActions('settings', ['post']),

    async getOutlets() {
      const OUTLETS = await this.post({ fetch_company_outlets: 'all' }).catch(() => null);
      if (OUTLETS) this.outlets = OUTLETS.data;
      if (this.outlets) this.employeeOutletId = this.outlets[0].id;
    },

    async fetchDbRoles() {
      const Roles = await this.post({ get_user_roles: 'all' });
      this.roles = Roles.data;
    },

    async createUserHandler() {
      const newUser = await this.post({
        create_user_account: this.user.company_id,
        first_name: this.firstName,
        last_name: this.lastName,
        user_name: this.fullname,
        role: this.role,
        outlet_id: this.employeeOutletId,
        password: this.password,
        token: new Date().getMilliseconds(),
        date_joined: moment().format('Y-m-d'),
      });
      if (!newUser.error) this.$emit('refetch');
    },
  },
};
</script>
<style scoped lang="scss">
.create_user {
    min-height: 250px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 15px;

    .options {
      display: flex;
      flex-direction: row;
      gap: 10px;
      margin-top: 15px;
      // align-items: right;
    }

}
</style>
