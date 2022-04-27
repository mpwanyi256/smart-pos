<template>
    <Basemodal
    title="New business outlet"
    :size="500" @close="$emit('close')">
        <div class="outlet_frm">
            <label>Outlet name</label>
            <BaseTextfield
                v-model.trim="name"
                placeholder="Outlet name"
                :inputType="'text'"
            />
            <label>Location</label>
            <BaseTextfield
                v-model.trim="location"
                placeholder="Outlet location"
                :inputType="'text'"
            />
            <label>Currency Prefix</label>
            <BaseTextfield
                v-model.trim="currency"
                placeholder="UGX"
                :inputType="'text'"
            />
            <div>
                <v-btn small
                    class="float-right"
                    :disabled="!isValid"
                    @click="createOutlet"
                >
                    Create outlet
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
  name: 'CreateOutlet',
  components: {
    Basemodal,
    BaseTextfield,
  },
  data() {
    return {
      location: '',
      name: '',
      currency: '',
      errorMessage: '',
    };
  },
  computed: {
    isValid() {
      return !!(this.name.length > 2 && this.location.length > 2);
    },
  },
  methods: {
    ...mapActions('settings', ['post']),

    async createOutlet() {
      const params = {
        name: this.name.toUpperCase(),
        location: this.location.toUpperCase(),
        currency: this.currency.toUpperCase(),
        create_new_outlet: 'new',
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
