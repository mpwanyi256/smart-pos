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
        </div>
        <v-alert class="ma-1 text-center" dense outlined type="warning" prominent border="left">
          <small>
            Please note that open dishes have no direct link with your
            <strong>inventory</strong>.<br>
            Hence deductions in <strong>stock</strong> willl no be reflected.
          </small>
        </v-alert>
      <LinearLoader v-if="loading" />
    </Basemodal>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import LinearLoader from '@/components/generics/Loading.vue';

export default {
  name: 'OpenDishModal',
  components: {
    Basemodal,
    BaseTextfield,
    LinearLoader,
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
      loading: false,
    };
  },
  computed: {
    ...mapGetters('menu', ['departments']),
    ...mapGetters('auth', ['user']),

    totalPrice() {
      return parseFloat((this.pricePerPax * this.paxes), 10);
    },

    allDepartments() {
      return this.departments.filter((D) => D.id > 0);
    },
  },

  methods: {
    ...mapActions('pos', ['post']),

    createOpenDish() {
      const openDish = {
        add_opendish_item: this.name.trim().toUpperCase(),
        paxes: parseFloat(this.paxes, 10),
        unit_price: this.pricePerPax,
        item_price: parseFloat((this.pricePerPax * this.paxes), 10),
        order_id: this.orderId,
        department_id: this.department,
        company_id: this.user.company_id,
        added_by: this.user.id,
      };
      this.loading = true;
      this.post(openDish)
        .then((response) => {
          if (response.error) {
            this.$eventBus.$emit('show-snackbar', response.message);
          } else {
            this.$eventBus.$emit('fetch-items');
            this.$emit('close');
          }
        })
        .catch((e) => {
          this.$eventBus.$emit('show-snackbar', e);
        })
        .finally(() => {
          this.loading = false;
        });
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
