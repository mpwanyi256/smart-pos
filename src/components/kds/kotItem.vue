<template>
    <div
      :class="highlighted ? 'highlight kot_item' : 'kot_item'"
        @click="moveItem"
    >
        <div class="item_name">
            <div class="item_name_pane">
                <div>
                    <p>
                      <span>{{ menuItem.quantity }}</span>
                        {{ menuItem.name.toUpperCase() }}
                    </p>
                </div>
                <div>
                    <small v-if="!showPreparationTime">
                      <span :class="`${iconColor}--text`">
                        {{ timeGone }}
                      </span>
                    </small>
                    <small v-else>
                      {{ getHours(menuItem.delay_time) }}
                    </small>
                </div>
            </div>
            <p v-if="menuItem.notes"
            class="notes">Notes: {{ menuItem.notes }}</p>
        </div>
        <!-- TO DO :: implement Addons -->
        <AddOns
          v-if="menuItem.addons.length"
          :addons="menuItem.addons"
        />
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import AddOns from '@/components/generics/AddOns.vue';

export default {
  name: 'KotItem',
  props: {
    highlighted: {
      type: Boolean,
      required: true,
    },
    showPreparationTime: {
      type: Boolean,
      required: true,
    },
    menuItem: {
      type: Object,
      required: true,
    },
    columnClass: {
      type: String,
      required: true,
    },
  },
  components: {
    AddOns,
  },
  computed: {
    ...mapGetters('auth', ['user']),

    isAllowedToMoveItem() {
      return this.user ? this.user.role === 4 : false;
    },

    timeGone() {
      const minutes = this.menuItem.delay_time;
      return minutes > 0 ? this.getHours(minutes) : 'Now';
    },
    minutesGone() {
      return this.menuItem.minutes_gone;
    },
    iconColor() {
      let color;
      switch (this.columnClass) {
        case 'just_in':
          color = 'grey';
          break;
        case 'delaying':
          color = 'orange';
          break;
        case 'ready':
          color = 'green';
          break;
        case 'delayed':
          color = 'red';
          break;
        default:
          color = 'grey';
      }
      return color;
    },
  },

  methods: {
    moveItem() {
      if (this.isAllowedToMoveItem) this.$emit('mark-as-served', this.menuItem);
      else this.$eventBus.$emit('show-snackbar', 'Sorry, you cannot perfom actions on KDS');
    },

    getHours(minutes) {
      let hrs;
      if (minutes < 60) {
        hrs = `${minutes} mins`;
      } else if (minutes >= 60) {
        const Hrs = minutes / 60;
        const mins = minutes % 60;

        hrs = `${Math.round(Hrs)}Hrs ${Math.round(mins)}mins`;
      }

      return hrs;
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

.highlight {
  background-color: $gray-90;
}

.kot_item {
  min-height: 50px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: large;
  border-bottom: 1px solid $border-color;
  justify-content: center;
  font-family: $font-style;

  .just_in {
    background-color: $white;
    color: $black;
  }

  .delaying {
    background-color: $orange;
    color: $black;
  }

  .delayed {
    background-color: $red;
    color: $white !important;
  }

    .item_name {
        padding-left: 5px;

        .item_name_pane {
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-weight: 400;

            >div {
              padding: 3px;
              p {
                width: 100%;
                justify-content: left;
                align-items: center;
                color: $black;
                font-weight: 450;
                font-style: normal;
                font-size: 16px;
                line-height: 150%;
                letter-spacing: -0.005em;
                margin: 0;

                span {
                  font-weight: 600;
                  color: $white;
                  background-color: $black;
                  padding: 2px;
                  border: 1px solid $black;
                  border-radius: 50%;
                  margin: 5px;
                }
              }
            }

            >div:last-child {
              // direction: rtl;
              text-align: right;
              padding-right: 5px;
            }
        }

        .notes {
            color: $grey;
            font-size: medium;
        }
    }

    .add_ons {
        display: inline-flex;
        flex-direction: row;
        gap: 10px;
        overflow-y: hidden;
        overflow-x: auto;
        align-items: center;
        font-size: medium;
        padding: 10px;

        >div {
            min-width: 100px;
            border-radius: 15px;
            border: 1px solid $blue;
            padding: 0 5px 0 5px;
        }
    }
}

.kot_item:hover {
  // background-color: $light-grey;
  color: $black-text;
  cursor: pointer;
}

.just_in {
  // background-color: $white;
  color: $blue;
}

.delaying {
  // background-color: $white;
  color: $orange;
}

.delayed {
  background-color: $red;
  // color: $red !important;
}

.ready {
  // background-color: $bg_color !important;
  color: $green !important;
}

</style>
