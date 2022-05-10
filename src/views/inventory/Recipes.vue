<template>
  <div class="recipes_main">
    <div class="recipes_table">
    <LoadingSpinner class="large" v-if="loading" />
    <Table v-else>
      <template #header>
        <tr>
          <th>
            <div class="item_name">
              <BaseTooltip
                @button="downloadCSV"
                :disabled="loading"
                message="Download receipes" icon="download"
                color="green"
              />
              <BaseTextfield v-model="search" placeholder="Search" />
              <v-select
                dense outlined
                label="Department"
                :items="departments"
                :disabled="loading"
                item-text="name"
                item-value="id"
                v-model="display"
              />
            </div>
          </th>
          <th>Category</th>
          <th>Menu price</th>
          <th>Average Cost price</th>
          <th>Recipe</th>
        </tr>
      </template>
      <template #body>
        <tr v-for="item in menuItems" :key="item.id">
          <td>{{ item.name }}</td>
            <td>{{ item.category }}</td>
          <td>{{ item.price_display }}</td>
          <td :class="[{no_purchases : item.average_cost_price == '0'}]">
              {{ item.average_cost_price == '0' ?
              'No purchases found' : item.average_cost_price }}</td>
          <td>
            <v-btn small text @click="viewRecipeInfo(item)">
              View
            </v-btn>
          </td>
        </tr>
      </template>
    </Table>
    </div>
    <Pagination @change="page = $event" :length="totalPaginationItems" />
    <MenuItemRecipeModal
      v-if="showRecipe && menuItemSelected"
      :menuItem="menuItemSelected"
      @close="reloadReceipes"
    />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Table from '@/components/generics/new/Table.vue';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import MenuItemRecipeModal from '@/components/inventory/store/MenuItemRecipeModal.vue';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import LoadingSpinner from '@/components/generics/LoadingSpinner.vue';
import DownloadCSVMixin from '@/mixins/DownloadCSVMixin';
import Pagination from '@/components/generics/new/Pagination.vue';

export default {
  name: 'Recipes',
  mixins: [DownloadCSVMixin],
  components: {
    Table,
    MenuItemRecipeModal,
    BaseTextfield,
    BaseTooltip,
    LoadingSpinner,
    Pagination,
  },
  data() {
    return {
      showRecipe: false,
      menuItemSelected: null,
      search: '',
      display: 0,
      loading: false,
      menuItems: [],
      page: 1,
      totalStoreItems: 0,
      itemsPerPage: 15,
    };
  },
  computed: {
    ...mapGetters('menu', ['departments']),
    ...mapGetters('auth', ['user']),

    totalPaginationItems() {
      return Math.ceil(this.totalStoreItems / this.itemsPerPage);
    },
  },
  watch: {
    display() {
      this.page = 1;
      this.$nextTick(() => {
        this.fetchMenuItems();
      });
    },
    page: {
      handler() {
        this.fetchMenuItems();
      },
      immediate: true,
    },
    search: {
      handler(val) {
        const strLength = val.length;
        if (strLength >= 3 || strLength === 0) {
          this.page = 1;
          this.$nextTick(() => {
            this.fetchMenuItems();
          });
        }
      },
      immediate: true,
    },
  },
  async created() {
    await this.fetchMenuItems();
    await this.fetchMenuDepartments();
  },
  methods: {
    ...mapActions('menu', ['getDepartments', 'post']),

    async fetchMenuItems() {
      this.loading = true;
      this.post({
        fetch_store_menu_items: this.display,
        company_id: this.user.company_id,
        page: this.page,
        search: this.search.trim(),
      })
        .then((res) => {
          this.menuItems = res.data;
          this.totalStoreItems = res.total_items;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    async fetchMenuDepartments() {
      await this.getDepartments(0);
    },

    downloadCSV() {
      // this.reloadReceipes();
      const data = this.menuItems.map((Item) => ({
        menu_item_name: Item.name.toUpperCase(),
        category: Item.category,
        sale_price: Item.price_display,
        average_cost_price: Item.average_cost_price,
      }));
      this.download(data, 'Menu receipe');
    },

    async reloadReceipes() {
      this.showRecipe = false;
      await this.fetchMenuItems();
    },

    viewRecipeInfo(item) {
      this.menuItemSelected = item;
      this.showRecipe = true;
    },
  },
};
</script>
<style lang="scss">
@import '@/styles/constants.scss';

  .recipes_main {
    height: calc(100vh - 52px);
    width: 100%;
    display: flex;
    flex-direction: column;
    color: $black;
    overflow: hidden;

    .recipes_table {
      height: calc(100vh - 112px);
      overflow-y: auto;
    }
  }

  .item_name {
    width: 100%;
    display: inline-flex;
    gap: 15px;
    padding-top: 5px;
    direction: ltr;
    padding-right: 15px;
    text-align: left;

    .download_btn {
      background-color: $green !important;
      color: $white !important;
    }
  }

  .no_purchases {
    color: $red;
  }

  ::v-deep .v-input__control {
    top: 0;
    bottom: 0;
  }
</style>
