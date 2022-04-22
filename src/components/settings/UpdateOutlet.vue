<template>
    <Basemodal
    title="Update business outlet"
    :size="500" @close="$emit('close')">
        <div class="outlet_frm">
            <label>Outlet name</label>
            <BaseTextfield
                v-model="outlet.name"
                :preset="outlet.name"
                placeholder="Outlet name"
                :inputType="'text'"
            />
            <label>Location</label>
            <BaseTextfield
                v-model.trim="outlet.location"
                :preset="outlet.location"
                placeholder="Outlet location"
                :inputType="'text'"
            />

            <label>Location</label>
            <BaseTextfield
                v-model.trim="outlet.currency"
                :preset="outlet.currency"
                placeholder="Outlet currency"
                :inputType="'text'"
            />
            <div>
                <p v-if="errorMessage">{{ errorMessage }}</p>
                <v-btn small
                    class="float-right"
                    :disabled="!isValid"
                    @click="updateOutlet"
                >
                    Update outlet
                </v-btn>
            </div>
        </div>
    </Basemodal>
</template>
<script>
import { mapActions } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';

export default {
  name: 'UpdateOutlet',
  props: {
    outlet: {
      type: Object,
      required: true,
    },
  },
  components: {
    Basemodal,
    BaseTextfield,
  },
  data() {
    return {
      errorMessage: '',
    };
  },
  computed: {
    isValid() {
      return !!(this.outlet.name.length > 2 && this.outlet.location.length > 2);
    },
  },
  watch: {
    errorMessage(val) {
      if (val) {
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    },
  },
  methods: {
    ...mapActions('settings', ['post']),

    async updateOutlet() {
      const params = {
        name: this.outlet.name.toUpperCase(),
        location: this.outlet.location.toUpperCase(),
        currency: this.outlet.currency.toUpperCase(),
        update_outlet_info: this.outlet.id,
      };
      const Outlet = await this.post(params).catch(() => null);
      if (!Outlet || Outlet.error) this.errorMessage = Outlet.message;
      else this.$emit('close');
    },
  },
};
</script>
<style scoped lang="scss">
    .outlet_frm {
        display: flex;
        flex-direction: column;
        gap: 15px;
        min-height: 300px;
        justify-content: center;
        padding: 16px;
    }
</style>
