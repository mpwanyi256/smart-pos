<template>
  <div class="menu_listing">
    <div class="search_area">
      <p>Menu items</p>
      <div class="search">
        <input type="text" v-model="menuSearchKey"
          class="search_field" placeholder="Search" />
        <BaseTooltip
          v-if="runningOrderId"
          @button="addClient = true"
          message="Add client"
          icon="plus"
          color="grey"
        />
        <v-btn
          @click="$emit('create-order')"
          text class="btn_create_order"
          v-show="companyType == 2">
            <v-icon left>mdi-plus</v-icon>
          Create new order
        </v-btn>
      </div>
    </div>
    <div class="menu_items_list">
      <div class="menu">
        <template v-if="loading">
          <LoadingKds
            v-for="i in 4"
            :key="`cat-holder-key-${i}`"
            :count="8"
          />
        </template>
        <template v-else>
          <MenuItem
            v-for="item in items" :key="item.id"
            :item="item"
            @addItem="$emit('addItem', $event)"
          />
        </template>
      </div>
    </div>
    <CreateClientMOdal
      v-if="addClient"
      @close="addClient = false"
    />
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import MenuItem from '@/components/pos/menu/MenuItem.vue';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import CreateClientMOdal from '@/components/pos/manage/CreateClientModal.vue';
import LoadingKds from '@/components/kds/LoadingKds.vue';

export default {
  name: 'MenuItems',
  components: {
    MenuItem,
    BaseTooltip,
    CreateClientMOdal,
    LoadingKds,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      menuSearchKey: '',
      addClient: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('pos', ['runningOrderId']),

    companyType() {
      return (this.user && this.user.business_type) ? this.user.company_info.business_type : 0;
    },
  },
  watch: {
    menuSearchKey(val) {
      this.$emit('searchMenu', val);
    },
  },
};
</script>
<style lang="scss">
@import '@/styles/pos.scss';

.menu_listing {
  height: 100%;
  background-color: $white;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .search_area {
    height: 56px;
    display: grid;
    grid-template-columns: 50% 50%;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid $bg_color;
    background-color: $header;

    p {
      margin-left: 15px;
      font-size: 18px;
      color: $black-text;
    }

    .search {
      direction: rtl;
      display: inline-flex;
      padding-right: 10px;
      gap: 10px;

      .btn_create_order {
        border: 1px solid $white;
        background-color: $white;
        color: $blue;
        height: 35px;
        font-size: 12px;
        font-weight: inherit;
        text-transform: capitalize;
        direction: ltr;
        box-shadow: $elevation-default;
      }

      .search_field, .search_field:focus, .search_field:hover {
        height: 35px;
        border: 1px solid $white;
        background-color: $white;
        border-radius: 5px;
        margin-right: 10px;
        direction: ltr;
        padding-left: 5px;
        padding-right: 5px;
        box-shadow: $elevation-default;
      }

    }
  }

  .menu_items_list {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    .menu {
      display: grid;
      max-height: 100%;
      grid-template-columns: 25% 25% 25% 25%;
    }
  }
}
</style>
