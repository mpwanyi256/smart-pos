<template>
    <div class="waiter">
        <div class="avator">
            <Avatar src="" class="large" />
        </div>
        <div class="sales-info">
            <p class="name">{{ fullName }}</p>
            <p class="orders">{{ orders }}</p>
            <!-- <p class="settled">22 Settled</p>
            <p class="pending">10 Pending</p> -->
        </div>
    </div>
</template>
<script>
import Avatar from '@/components/generics/new/Avatar.vue';

export default {
  name: 'Waiter',
  props: {
    waiter: {
      type: Object,
      required: true,
    },
  },
  components: {
    Avatar,
  },
  computed: {
    fullName() {
      return `${this.waiter.first_name} ${this.waiter.last_name}`;
    },
    orders() {
      const ORDERS = this.waiter.orders;
      return this.waiter.orders > 1 ? `${ORDERS} orders` : `${ORDERS} order`;
    },
  },
};
</script>
<style lang="scss">
@import '@/styles/constants.scss';

.waiter {
    width: auto;
    display: grid;
    grid-template-columns: 20% 80%;
    gap: 5px;
    background-color: $white;
    padding: 3px;
    overflow: hidden;
    border-radius: 4px;
    margin: 5px;

    .avator {
      display: inline-flex;
      justify-content: left;
      align-items: center;
    }

    .sales-info {
        display: flex;
        flex-direction: column;
        justify-content: left;
        padding-left: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        >p {
          font-size: 14px;
          line-height: 1.5;
          top: 0;
          bottom: 0;
          margin: 0;
          text-align: left;
          margin-right: 10px;
        }

        .name {
          color: $black;
          font-size: 16px;
        }

        .orders {
          color: $accent;
        }

        .settled {
          color: $green;
        }

        .pending {
          color: $orange;
        }
    }
}

</style>
