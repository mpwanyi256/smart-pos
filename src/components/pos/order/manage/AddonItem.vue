<template>
    <div class="order_item"
        :class="item.status == 0 ? 'pending': ''"
        @click="$emit('viewItems', item)"
    >
        <div class="item_name">
            <p>
            <strong class="mr-2">
              {{ item.quantity }}
            </strong>
            {{ item.item_name }}
            <br>
            <small>
                <span>
                    <v-btn
                        class="notes"
                        x-small text
                        @click="$emit('delete', item)">
                        <v-icon class="icon" left>mdi-book-open-blank-variant</v-icon>
                        {{ item.notes }}
                    </v-btn>
                </span>
            </small>
            </p>
        </div>
        <div class="item_price pt-3">
            <BaseTooltip small v-if="isPending"
              @button="$emit('delete', item)"
              message="Delete addon"
              icon="delete"
              color="red"
            />
        </div>
    </div>
</template>
<script>
import BaseTooltip from '@/components/generics/BaseTooltip.vue';

export default {
  name: 'AddonItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
    isPending: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    BaseTooltip,
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/pos.scss';

    .order_item {
        height: auto;
        width: inherit;
        background-color: $white;
        border-bottom: 0.5px solid $header;
        display: grid;
        grid-template-columns: 80% 20%;
        font-size: 14px;
        color: $black;
        cursor: pointer;
        text-transform: uppercase;

        .item_name {
            display: flex;
            flex-direction: column;
            justify-content: left;
            padding-left: 10px;
            line-height: 1.5;
            text-overflow: ellipsis;
            overflow: hidden;
            width: 100%;
            white-space: nowrap;
            padding-right: 5px;

            .notes, .notes .icon {
                color: $black;
                size: 14px;
                text-transform: capitalize;
            }
        }

        .item_price {
            justify-content: center;
            text-align: center;
        }

        .item_name, .item_actions, .item_price {
            display: flex;
            // align-items: center;
        }

        .item_actions {
            direction: rtl;
        }
    }

    .order_item:hover {
        font-weight: bold;
    }

    .pending {
        background-color: $header;
    }
</style>
