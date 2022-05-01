<template>
  <div class="new_recipe_item_entry">
    <div class="select_store_item">
      <div class="store_item_select">
        <div class="menu_items_filter">
          <div class="store_column">
            <p v-if="message" class="red--text text-center ma-2">{{ message }}</p>
            <Table>
              <template slot="header">
                <tr>
                  <th colspan="2">
                    <BaseTextfield
                      v-model="store_items_filter"
                      class="input_field"
                      placeholder="Search ..."
                    />
                  </th>
                </tr>
              </template>
              <template slot="body">
                <tr
                  v-for="i in storeItems"
                  :key="i.id">
                  <td>{{ i.name }}</td>
                  <td>
                    <v-btn
                      :disabled="exists(i)" small text @click="addKnockOff(i)">
                      <v-icon left>mdi-plus</v-icon>Add
                    </v-btn>
                  </td>
                </tr>
              </template>
            </Table>
          </div>
        </div>
      </div>
    </div>
    <div>
    </div>
    <KnockOffAmountEntryModal
      v-if="selected_store_item && openKnockoffModal"
      :selected_store_item="selected_store_item"
      @close="openKnockoffModal = false"
      @add="addRecipeItem"
    />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import BaseTextfield from '@/components/generics/BaseTextfield.vue';
import Table from '@/components/generics/new/Table.vue';
import KnockOffAmountEntryModal from '@/components/inventory/store/KnockOffAmountEntryModal.vue';

export default {
  name: 'AddRecipeItemRow',
  props: {
    menuItem: {
      type: Object,
      required: true,
    },
    recipe: {
      type: Array,
      required: true,
    },
  },
  components: {
    BaseTextfield,
    Table,
    KnockOffAmountEntryModal,
  },
  data() {
    return {
      store_items_filter: '',
      selected_store_item: null,
      knockOffQuantity: '',
      message: '',
      openKnockoffModal: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('inventory', ['storeItems']),
    filteredItems() {
      return this.storeItems;
    },
  },
  watch: {
    store_items_filter: {
      handler(val) {
        if (val.length === 0 || val.length >= 3) {
          this.page = 1;
          this.$nextTick(() => {
            this.fetchStoreItems();
          });
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('inventory', ['getStoreItems', 'updateItem']),

    fetchStoreItems() {
      this.getStoreItems({
        company_id: this.user.company_id,
        page: 1,
        search: this.store_items_filter,
      });
    },

    exists(item) {
      return this.recipe.findIndex((Item) => Item.store_item_id === item.id) >= 0;
    },

    isSelected(id) {
      return this.selected_store_item ? this.selected_store_item.id === id : false;
    },

    addKnockOff(i) {
      this.selected_store_item = i;
      this.openKnockoffModal = true;
    },

    async addRecipeItem(quantity) {
      this.openKnockoffModal = false;
      const recipe = {
        store_item_id: this.selected_store_item.id,
        menu_item: this.menuItem.id,
        knock_off: quantity,
        added_by: this.user.id,
        add_recipe_item: this.selected_store_item.id,
        company_id: this.user.company_id,
      };
      const recipeAdd = await this.updateItem(recipe);
      if (!recipeAdd.error) this.$emit('refresh');
      this.message = recipeAdd.message;
      setTimeout(() => {
        this.message = '';
        this.selected_store_item = null;
      }, 2000);
    },
  },
  created() {
    this.fetchStoreItems();
  },
};
</script>
<style lang="scss">
@import '@/styles/constants.scss';

.new_recipe_item_entry {
  width: 100%;
  background-color: $white !important;
  height: 450px;
  font-family: $font-style;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  h3 {
    margin: 5px;
  }

  .select_store_item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    border: 1px solid $border-color;
    border-radius: 5px;
    box-shadow: $elevation-low;

      .input_field {
        margin: 5px;
        color: $grey;
      }

      .menu_items_filter {
        height: 450px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;

        .store_column {

          .is_selected, .is_selected:hover {
            background-color: $border-color !important;
            color: $black !important;
            font-weight: bold;
          }
        }
      }
    }

    .knock_off_entry {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 15px;

      .frm_entry >div {
        display: grid;
        grid-template-columns: 40% 60%;

        >div {
          .btn_add_knockoff {
            background-color: $blue !important;
            color: $white;
          }
        }
      }
    }
}
</style>
