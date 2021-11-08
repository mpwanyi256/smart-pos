<template>
    <div class="kot_item"
        @click="moveItem"
    >
        <div class="item_name">
            <div class="item_name_pane">
                <div>
                    <p>
                        {{ menuItem.quantity }}
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
                      {{ getHours(menuItem.preparation_time) }}
                    </small>
                </div>
            </div>
            <p v-if="menuItem.notes"
            class="notes">Notes: {{ menuItem.notes }}</p>
        </div>
        <!-- TO DO :: implement Addons -->
        <AddOns v-if="false" />
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import AddOns from '@/components/generics/AddOns.vue';

export default {
  name: 'KotItem',
  props: {
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
      const minutes = this.menuItem.minutes_gone;
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
            display: grid;
            grid-template-columns: 70% 30%;
            font-weight: 400;

            >div {
              p {
                width: 100%;
                display: inline-flex;
                justify-content: left;
                align-items: center;
                color: $kds-text-header-color;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-style: normal;
                font-size: 16px;
                line-height: 150%;
                letter-spacing: -0.005em;
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
  background-color: $light-grey;
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
