<template>
    <Basemodal
        :title="`${addon.name}`"
        :size="500" @close="$emit('close')">
        <div class="addon_item_input">
            <div>
                <label>Quantity</label>
                <BaseTextfield
                    v-model="quantity"
                    :preset="quantity"
                    input-type="number" placeholder="Quantity"
                />
            </div>
            <div>
                <label>Remarks</label>
                <BaseTextfield v-model="notes" placeholder="Add notes" />
            </div>
            <div>
                <label></label>
                <v-btn @click="saveItemAddon" color="white" block :disabled="quantity <= 0">
                Add
                </v-btn>
            </div>
        </div>
    </Basemodal>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';

export default {
  name: 'AddonEntryModal',

  props: {
    orderItem: {
      type: Object,
      required: true,
    },
    addon: {
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
      quantity: 1,
      notes: '',
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
  },
  methods: {
    ...mapActions('pos', ['post']),
    saveItemAddon() {
      const ADDON = {
        addon_item_addon: this.addon.id,
        order_item_id: this.orderItem.id,
        quantity: this.quantity,
        notes: this.notes,
        added_by: this.user.id,
      };

      this.post(ADDON)
        .then((res) => {
          if (res.error_message) {
            this.$eventBus.$emit('show-snackbar', res.error_message);
          } else {
            this.$eventBus.$emit('show-snackbar', res.message);
            this.$emit('reload');
          }
        }).catch((e) => {
          console.log('Error adding addon', e);
        });
    },
  },
};
</script>
<style scoped lang="scss">
    .addon_item_input {
        min-height: 100px;
        padding: 5px;

        >div {
            display: grid;
            grid-template-columns: 40% 60%;
            margin: 5px;
            color: black;
        }
    }
</style>
