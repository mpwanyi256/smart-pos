<template>
  <Basemodal :title="menuItem.name +' receipe'" :size="1000" @close="$emit('close')">
    <div class="recipe_view">
      <div class="receipe_section">
        <Table>
          <template slot="header">
            <tr>
              <th>
                Purchase Item
              </th>
              <th>Measure</th>
              <th>Knock off</th>
              <th>Delete</th>
            </tr>
          </template>
          <template slot="body">
            <tr v-for="storeItem in recipe" :key="storeItem.id">
              <td>{{ storeItem.name }}</td>
              <td>{{ storeItem.measure }}</td>
              <td>
                <RecipeItemKnockOff
                  @refresh="fetchRecipe"
                  :recipeItem="storeItem"
                />
              </td>
              <td>
                <v-btn @click="deleteRecipe(storeItem.id)" small icon class="red--text darken--3">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </Table>
      </div>
      <div class="add_item_section">
        <AddRecipeItemRow
          @close="addRecipe = false"
          @refresh="fetchRecipe"
          :menuItem="menuItem"
          :recipe="recipe"
          />
      </div>
    </div>
    <ConfirmModal
      v-if="confirmDelete && selectedItem"
      @close="confirmDelete = false"
      @yes="dropRecipeItem"
    />
  </Basemodal>
</template>
<script>
import { mapActions } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import ConfirmModal from '@/components/generics/ConfirmModal.vue';
import Table from '@/components/generics/new/Table.vue';
import RecipeItemKnockOff from '@/components/inventory/store/RecipeItemKnockOff.vue';
import AddRecipeItemRow from '@/components/inventory/store/AddRecipeItemRow.vue';

export default {
  name: 'MenuItemRecipeModal',
  components: {
    Basemodal,
    Table,
    RecipeItemKnockOff,
    AddRecipeItemRow,
    ConfirmModal,
  },
  props: {
    menuItem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      recipe: [],
      addRecipe: false,
      confirmDelete: false,
      selectedItem: null,
      loading: true,
    };
  },
  async created() {
    this.fetchRecipe();
  },
  computed: {
    hasRecipe() {
      return this.recipe.length > 0;
    },
  },
  methods: {
    ...mapActions('inventory', ['getItemRecipe', 'updateItem']),

    async fetchRecipe() {
      this.loading = true;
      this.recipe = await this.getItemRecipe({ menu_item_id: this.menuItem.id });
      this.loading = false;
    },

    deleteRecipe(itemId) {
      this.selectedItem = itemId;
      this.confirmDelete = true;
    },

    async dropRecipeItem() {
      const dropReceipe = {
        drop_receipe_item: this.selectedItem,
      };
      // refresh after drop
      await this.updateItem(dropReceipe);
      await this.fetchRecipe();
      this.confirmDelete = false;
    },
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

  .recipe_view {
    height: 450px;
    overflow: hidden;
    display: grid;
    grid-template-columns: 50% 50%;

    >div {
      max-height: 450px;
      overflow: auto;
    }

    .empty_state {
      width: 100%;
      height: inherit;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
  }

  .add_receipe_button {
    background-color: $blue !important;
    color: $white;
  }
</style>
