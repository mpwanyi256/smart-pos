<template>
    <Basemodal
      title="Create Open Dish"
      :size="550" @close="$emit('close')"
    >
        <div class="open-dish">
            <div class="form-control">
                <label>Name</label>
                <BaseTextfield placeholder="Open dish name" v-model="name"/>
            </div>
            <div class="form-control">
                <label>Dishes</label>
                <BaseTextfield inputType="number" placeholder="Number of dishes" v-model="paxes"/>
            </div>
            <div class="form-control">
                <label>Unit Price</label>
                <BaseTextfield inputType="number" placeholder="Unit price" v-model="pricePerPax"/>
            </div>
            <div class="form-control">
                <label>Department</label>
                <v-select
                  outlined dense
                  :items="allDepartments"
                  item-text="name"
                  item-value="id"
                  item-color="black"
                  v-model="department"
                />
            </div>
            <div class="form-control">
              <h3>Total: {{ totalPrice }}</h3>
            </div>
            <div class="form-control">
                <v-btn
                  :disabled="totalPrice <= 0 || !name"
                  @click="createOpenDish"
                  small
                >Create Open Dish</v-btn>
            </div>
            <p class="red--text text-center">
              Please not that open dishes have no direct link with your inventory.
            </p>
        </div>
    </Basemodal>
</template>
<script>
import { mapGetters } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
// import BaseAlert from '@/components/generics/new/BaseAlert.vue';

export default {
  name: 'OpenDishModal',
  components: {
    Basemodal,
    BaseTextfield,
    // BaseAlert,
  },
  props: {
    orderId: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      name: '',
      paxes: 1,
      pricePerPax: 0,
      department: 2,
    };
  },
  computed: {
    ...mapGetters('menu', ['departments']),

    totalPrice() {
      return parseFloat((this.pricePerPax * this.paxes), 10);
    },

    allDepartments() {
      return this.departments.filter((D) => D.id > 0);
    },
  },

  methods: {
    createOpenDish() {
      const openDish = {
        name: this.name.trim().toUpperCase(),
        paxes: parseFloat(this.paxes, 10),
        unit_price: this.pricePerPax,
        item_price: parseFloat((this.pricePerPax * this.paxes), 10),
        order_id: this.orderId,
      };
      console.log('openDish', openDish);
    },
  },
};
</script>
<style scoped lang="scss">
    @import '@/styles/constants.scss';

    .open-dish {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;

        .form-control {
            display: inline-flex;
            gap: 10px;
            width: 100%;

            label {
                width: 30%;
            }

            ::v-deep .text_field, .v-input {
                width: 100%;
            }

            ::v-deep .v-btn {
                right: -71%;
            }
        }
    }

</style>
