<template>
    <Basemodal
        title="Add Waiter"
        :size="700" @close="$emit('close')">
        <template name="action">
          <BaseTextfield v-model.trim="search" />
        </template>
        <div class="waiters">
            <div class="waiters_list">
              <EmployeeCard
                v-for="waiter in waiters"
                :key="`waiter${waiter.id}`"
                :employee="waiter"
                :isSelected="waiter.id == order.waiter_id"
                @picked="addWaiterToOrder($event.id)"
              />
            </div>
        </div>
    </Basemodal>
</template>
<script>
import { mapActions } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import EmployeeCard from '@/components/generics/new/EmployeeCard.vue';

export default {
  name: 'AddWaiterModal',
  components: {
    Basemodal,
    BaseTextfield,
    EmployeeCard,
  },
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      search: '',
      users: [],
    };
  },
  computed: {
    waiters() {
      return this.users.filter((User) => User.user_role === 3 && User.is_active === 1
              && User.user_name.toLowerCase().match(this.search.toLowerCase()));
    },
  },
  async created() {
    await this.fetchEmployees();
  },
  methods: {
    ...mapActions('pos', ['updateOrder']),

    async fetchEmployees() {
      const employees = await this.updateOrder({ fetch_users: localStorage.getItem('smart_company_id') });
      if (!employees.error) this.users = employees.data;
    },

    async addWaiterToOrder(waiterId) {
      const addWaiter = await this.updateOrder({
        add_waiter: waiterId,
        order_id: this.order.order_id,
      });
      if (!addWaiter.error) {
        await this.$eventBus.$emit('get-waiter-info', this.order.order_id);
        this.$eventBus.$emit('reset-running-order', this.order.order_id);
        this.$emit('close');
      }
    },

  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.waiters {
  height: 340px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  margin-top: 10px;

  .waiters_list {
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    max-height: 340px;
    overflow-y: auto;
    overflow-x: hidden;
    gap: 5px;

    // .is_selected, .is_selected:hover {
    //   background-color: $accent-color;
    //   color: $white;
    // }

    // >div {
    //   height: 70px;
    //   display: flex;
    //   justify-content: center;
    //   justify-items: center;
    //   align-items: center;
    //   border: 1px solid $border-color;
    //   overflow: hidden;
    //   padding: 15px;
    //   text-align: center;
    //   cursor: pointer;
    // }

    // >div:hover {
    //   background-color: $border-color;
    // }

  }

}
</style>
