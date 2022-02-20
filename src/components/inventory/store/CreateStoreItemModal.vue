<template>
  <Basemodal :title="'Create item'" :size="700" @close="$emit('close')">
    <div class="update_area">
        <div class="frm_entry">
          <div class="label">Item Name</div>
          <div class="entry_update">
            <v-text-field outlined dense v-model="name"></v-text-field>
          </div>
        </div>
        <div class="frm_entry">
          <div class="label">Unit measure</div>
          <div class="entry_update">
            <v-select dense outlined
              :items="storeMeasures"
              item-text="name"
              item-value="id"
              v-model="unit_measure_id"
            />
          </div>
        </div>
        <div class="frm_entry">
          <div class="label">Pack size</div>
          <div class="entry_update">
            <v-text-field outlined dense v-model="pack_size"></v-text-field>
          </div>
        </div>
        <div class="frm_entry">
          <div class="label">
            {{ `Price per ${pack_size}` }}
          </div>
          <div class="entry_update">
            <v-text-field outlined dense v-model="unit_price"></v-text-field>
          </div>
        </div>
        <div class="frm_entry">
          <div class="label">{{ `Min stock in ${selectedMeasureName.toLowerCase()}`}}</div>
          <div class="entry_update">
            <v-text-field outlined dense
            :hint="`Min stock in ${selectedMeasureName.toLowerCase()}`" v-model="min_stock"/>
          </div>
        </div>
        <!-- <div class="frm_entry">
          <div class="label">Category</div>
          <div class="entry_update">
            <v-select dense outlined
              :items="categories"
              item-text="name"
              item-value="id"
              v-model="categoryId"
            />
          </div>
        </div> -->
        <div class="frm_entry">
          <div class="label">&nbsp;</div>
          <div class="entry_update">
            <v-btn text class="float-right" @click="createStoreItem">Create Item</v-btn>
          </div>
        </div>
        <BaseAlert v-if="error" alert="info" :message="error" />
        <LinearLoader v-if="loading" />
    </div>
  </Basemodal>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import BaseAlert from '@/components/generics/BaseAlert.vue';
import LinearLoader from '@/components/generics/Loading.vue';

export default {
  name: 'CreateStoreItemModal',
  components: {
    Basemodal,
    BaseAlert,
    LinearLoader,
  },
  data() {
    return {
      name: '',
      min_stock: '',
      pack_size: '',
      unit_measure: '',
      unit_price: '',
      unit_measure_id: '',
      categoryId: 0,
      error: '',
      loading: false,
    };
  },
  computed: {
    ...mapGetters('inventory', ['storeMeasures', 'categories']),
    ...mapGetters('auth', ['user']),

    selectedMeasureName() {
      const measureSelect = this.storeMeasures
        .find((Measure) => Measure.id === this.unit_measure_id);
      return measureSelect ? measureSelect.name : '';
    },
  },
  watch: {
    error(val) {
      if (!val) return;
      setTimeout(() => {
        this.error = '';
      }, 3000);
    },
  },
  methods: {
    ...mapActions('inventory', ['getStoreMeasures', 'getStoreCategories', 'createItem']),

    createStoreItem() {
      if (!this.name || parseInt(this.pack_size, 10) <= 0 || !this.unit_measure_id
          || !this.min_stock) {
        this.error = 'Missing fields';
        return;
      }

      const newItem = {
        name: this.name,
        pack_size: this.pack_size,
        unit_price: this.unit_price,
        unit_measure_id: this.unit_measure_id,
        category_id: this.categoryId,
        minimum_stock: this.min_stock || 1,
        company_id: this.user.company_info.company_id,
      };
      this.loading = true;
      const created = this.createItem(newItem);
      this.loading = false;
      if (created.error) this.error = created.message;
      else this.$emit('reload');
    },
  },
  async created() {
    this.error = '';
    await this.getStoreCategories({ category_id: 'all' });
    await this.getStoreMeasures('all');
  },
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

  .update_area {
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 0;
    min-height: 300px;

    .frm_entry {
      display: grid;
      grid-template-columns: 30% 70%;
      align-items: center;
      height: 50px;
      // border-top: 1px solid $light-grey;
      // border-bottom: 1px solid $light-grey;
      font-size: 16px;
      color: $black;
    }
  }
</style>
