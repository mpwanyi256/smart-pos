<template>
    <div class="entry">
        <template v-if="update">
            <BaseTextfield v-model="updatedValue"
                :preset="updatedValue" placeholder="Enter value" />
            <v-btn small @click="updateSetting">
                Update
            </v-btn>
        </template>
        <template v-else>
            <div class="value" @click="update = true">
                {{ setting.status }}
            </div>
        </template>
    </div>
</template>
<script>
import BaseTextfield from '@/components/generics/BaseTextfield.vue';

export default {
  name: 'SettingUpdate',
  components: {
    BaseTextfield,
  },
  props: {
    setting: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      updatedValue: 0,
      update: false,
    };
  },
  methods: {
    updateSetting() {
      const payload = {
        setting: this.setting,
        value: parseInt(this.updatedValue, 10),
      };
      this.$emit('update', payload);
      this.update = false;
    },
  },
  created() {
    this.$nextTick(() => {
      this.updatedValue = this.setting.status;
    });
  },
};
</script>
<style scoped lang="scss">
    .entry {
        display: inline-flex;
        gap: 10px;

        .value {
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        }
    }
</style>
