<template>
  <v-row justify="space-around">
    <v-menu
      :key="text"
      :rounded="rounded"
      offset-y
      :close-on-click="true"
      :close-on-content-click="false"
    >
      <template v-slot:activator="{ attrs, on }">
        <v-btn
          class="black--text ma-5" text
          v-on="on"
          v-bind="attrs"
          ref="btn"
        >
          {{ text }}
        <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
        <div class="display-items">
            <BaseTextfield class="search" v-model="search" />
            <div class="items-list">
                <v-list>
                    <v-list-item
                        v-for="item in filteredItems"
                        :key="item.id"
                        link
                        :class="{'blue lighten-3': isActiveItem(item)}"
                    >
                    <v-list-item-title
                        v-text="item[`${itemDisplayKey}`]"
                        @click="selectItem(item)"
                    />
                    </v-list-item>
                </v-list>
            </div>
        </div>
    </v-menu>
  </v-row>
</template>
<script>
import BaseTextfield from '@/components/generics/BaseTextfield.vue';

export default {
  name: 'CustomDropdown',
  components: {
    BaseTextfield,
  },
  props: {
    text: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    itemDisplayKey: {
      type: String,
      required: true,
    },
    selectedItem: {
      type: String,
      required: false,
      default: () => '',
    },
  },
  data: () => ({
    search: '',
  }),
  computed: {
    filteredItems() {
      return this.items.filter((i) => i[`${this.itemDisplayKey}`].toLowerCase().includes(this.search.toLowerCase()));
    },
  },
  methods: {
    selectItem(item) {
      this.$emit('selected', item);
    },
    isActiveItem(item) {
      return item[`${this.itemDisplayKey}`] === this.selectedItem[`${this.itemDisplayKey}`];
    },
  },
};
</script>
<style scoped lang="scss">
.display-items {
    height: 250px;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;

    .search {
        position: fixed !important;
        width: 100%;
        z-index: 300;
    }

    .items-list {
        height: inherit;
        width: inherit;
        margin-top: 40px;
        z-index: 80;
        overflow-y: auto;
    }
}

.active {
    background-color: black !important;
    color: white !important;
}
</style>
