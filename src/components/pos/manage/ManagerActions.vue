<template>
    <Basemodal
      :title="`Actions`"
      :size="850" @close="$emit('close')">
      <div class="manager_actions">
          <div class="actions_list">
            <template v-for="(action, i) in actions">
              <div class="action"
                :key="i"
                @click="$emit('action', action.action)"
              >
                {{ action.name }}
              </div>
            </template>
          </div>
      </div>
    </Basemodal>
</template>
<script>
import Basemodal from '@/components/generics/Basemodal.vue';

export default {
  name: 'ManagerActions',
  components: {
    Basemodal,
  },
  data() {
    return {
      actions: [
        { name: 'View Sales Report', action: 'sales' },
        { name: 'Open new day', action: 'open' },
        { name: 'Extend License', action: 'license' },
        { name: 'Cloud sync', action: 'cloud' },
        { name: 'Credit payment', action: 'payment' },
        { name: 'Sync POS', action: 'sync-pos' },
      ],
    };
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.manager_actions {
  display: flex;
  flex-direction: column;
  gap: 15px;

  .actions_list {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        gap: 10px;
        padding-bottom: 15px;

        .action {
            height: 50px;
            min-width: 100px;
            background-color: $white;
            color: $black;
            box-shadow: $elevation-low;
            display: flex;
            justify-content: center;
            padding: 10px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
        }

    }

  }

</style>
