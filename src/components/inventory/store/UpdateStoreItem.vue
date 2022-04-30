<template>
  <Basemodal :title="item.name" :size="700" @close="$emit('close')">
  <template slot="action">
    <v-btn icon class="red" dark
      @click="confirmDelete = true"
    >
      <v-icon>mdi-delete</v-icon>
    </v-btn>
  </template>
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
            {{ `Price per ${pack_size} ${selectedMeasureName.toLowerCase()}` }}
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
        <div class="frm_entry">
          <div>&nbsp;</div>
          <div>
            <v-btn class="float-right" @click="updateStoreItem">Update</v-btn>
          </div>
        </div>
        <BaseAlert v-if="error" alert="info" :message="error" />
        <LinearLoader v-if="loading" />
        <ConfirmModal
          v-if="confirmDelete"
          :title="`Are you sure you want to delete ${name}?`"
          @close="confirmDelete = false"
          @yes="deleteItem"
        />
    </div>
  </Basemodal>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Basemodal from '@/components/generics/Basemodal.vue';
import BaseAlert from '@/components/generics/BaseAlert.vue';
import LinearLoader from '@/components/generics/Loading.vue';
import ConfirmModal from '@/components/generics/ConfirmModal.vue';

export default {
  name: 'UpdateStoreItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  components: {
    Basemodal,
    BaseAlert,
    LinearLoader,
    ConfirmModal,
  },
  data() {
    return {
      name: '',
      min_stock: '',
      pack_size: '',
      unit_measure: '',
      unit_price: '',
      unit_measure_id: '',
      error: '',
      loading: false,
      confirmDelete: false,
    };
  },
  computed: {
    ...mapGetters('inventory', ['storeMeasures']),

    selectedMeasureName() {
      const measureSelect = this.storeMeasures
        .find((Measure) => Measure.id === this.unit_measure_id);
      return measureSelect ? measureSelect.name : '';
    },
  },
  methods: {
    ...mapActions('inventory', ['getStoreMeasures', 'updateItem']),

    updateStoreItem() {
      const update = {
        update_store_item: this.item.id,
        name: this.name,
        pack_size: this.pack_size,
        unit_price: this.unit_price,
        unit_measure_id: this.unit_measure_id,
        minimum_stock: this.min_stock,
      };
      this.loading = true;
      const updated = this.updateItem(update);
      this.loading = false;
      if (updated.error) this.error = update.message;
      else this.$emit('reload');
    },

    deleteItem() {
      // eslint-disable-next-line no-restricted-globals
      // const confirmDelete = confirm('Are you sure you want to delete item?');
      // if (!confirmDelete) return;
      this.loading = true;
      const updated = this.updateItem({ delete_store_item: this.item.id });
      this.loading = false;
      if (updated.error) this.error = updated.message;
      this.$emit('reload');
    },
  },
  async created() {
    this.error = '';
    this.name = this.item.name;
    this.min_stock = this.item.min_stock;
    this.pack_size = this.item.pack_size;
    this.unit_measure = this.item.unit_measure;
    this.unit_price = this.item.unit_price;
    this.unit_measure_id = this.item.measure_id;
    // await this.getStoreCategories({ category_id: 'all' });
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
      font-size: 16px;
      color: $black;

      .actions {
        width: 100%;
        direction: rtl;
        display: flex;
        flex-direction: row;
        gap: 15px;
      }
    }
  }
</style>
