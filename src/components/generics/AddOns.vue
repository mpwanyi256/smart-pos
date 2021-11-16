<template>
    <div class="addons_display">
        <p>Addons</p>
        <div class="add_ons">
            <div v-for="addon in addons" :key="`addon-item-${addon.id}`">
                <div class="notes-chip">
                    <v-icon dark>mdi-bell</v-icon>
                    {{ `${addon.quantity} ${addon.item_name} (${addon.notes})` }}
                </div>
            </div>
        </div>
    </div>
</template>
<script>

export default {
  name: 'AddOns',

  props: {
    addons: {
      type: Array,
      required: true,
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

.notes-chip {
    background-color: $running !important;
    color: $white !important;
    margin-left: 2px;
    text-transform: capitalize;
    border-radius: inherit;
    padding: 3px;
    border-radius: 15px;
    border: 1px solid $blue;
}

.addons_display {
    display: flex;
    flex-direction: column;
    gap: 0;
    border-top: 1px solid $border-color;
    // background-color: $gray-90;
    margin-bottom: 10px;
    padding-bottom: 10px;

    p {
        font-size: 16px;
        color: $black;
        margin-left: 5px;
        font-weight: bold;
    }

    .add_ons {
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: hidden;
        overflow-x: auto;
        // align-items: center;
        font-size: medium;
        // padding: 10px;
        width: 100%;

        >div {
            min-width: 100px;
            border-radius: 15px;
            // border: 1px solid $blue;
            padding: 0 5px 0 5px;
            display: inline-flex;
            flex-direction: row;
        }
    }
}
</style>
