<template>
    <Basemodal :title="'Update menu item'" :size="700" @close="$emit('close')">
      <div class="update_area">
        <v-form @submit.prevent="updateMenuItem">
          <v-text-field dense outlined label="Item name" v-model="name" />
          <v-select
            dense outlined
            label="Category"
            :items="categories"
            item-text="name"
            item-value="id"
            v-model="categoryId"
          />
          <v-select
            dense outlined
            label="Section"
            :items="filteredDepartments"
            item-text="name"
            item-value="id"
            v-model="display"
          />
          <v-text-field dense outlined label="Item price" v-model="price" />
          <v-btn block type="submit" class="mt-3" dense>Update</v-btn>
        </v-form>
      </div>
      <LinearLoader v-if="loading" />
    </Basemodal>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import LinearLoader from '@/components/generics/Loading.vue';

export default {
  name: 'UpdateMenuItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  components: {
    Basemodal,
    LinearLoader,
  },
  data() {
    return {
      name: '',
      categoryId: '',
      display: '',
      price: '',
      loading: false,
    };
  },
  computed: {
    ...mapGetters('menu', ['categories', 'departments']),

    filteredDepartments() {
      return this.departments.filter((Dep) => Dep.name !== 'ALL');
    },
  },
  created() {
    this.getMenuCategories();
    if (!this.item) this.$emit('close');
    this.name = this.item.name;
    this.categoryId = parseInt(this.item.category_id, 10);
    this.display = parseInt(this.item.display, 10);
    this.price = this.item.price;
  },
  methods: {
    ...mapActions('menu', ['getMenuCategories', 'updateItem']),
    ...mapActions('auth', ['setError']),

    async updateMenuItem() {
      if (this.name.trim().length <= 0) {
        this.setError('Item name is required');
      // eslint-disable-next-line eqeqeq
      } else if (this.price.trim().lengh == 0) {
        this.setError('Item price is required');
      } else {
        const itemUpdate = {
          name: this.name,
          category_id: this.categoryId,
          display: this.display,
          price: parseInt(this.price, 10),
          item_id: this.item.id,
        };
        this.loading = true;
        const update = await this.updateItem(itemUpdate);
        if (update.error) this.setError(update.message);
        this.loading = false;
        this.$emit('reload');
      }
    },
  },
};
</script>
<style scoped>
  .update_area {
    padding: 15px;
    min-height: 300px;
  }
</style>
