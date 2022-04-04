<template>
  <div v-if="length > 1" class="text-center pagination">
    <v-pagination
      v-model="page"
      circle
      :length="length"
    />
  </div>
</template>
<script>
export default {
  name: 'Pagination',
  props: {
    length: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      page: 1,
    };
  },
  watch: {
    page(val) {
      this.$emit('change', val);
    },
  },
};
</script>
<style scoped>
    .pagination {
      height: 52px;
      background-color: inherit;
      padding-top: 15px;
      margin-left: 15px;
      margin-right: 15px;
    }
</style>
