<template>
  <div class="text-center pagination">
    <v-container v-if="length > 1">
      <v-row justify="center">
        <v-col cols="8">
          <v-container class="max-width">
            <v-pagination
              v-model="page"
              class="my-4"
              circle
              :length="length"
            ></v-pagination>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
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
        height: 36px;
        background-color: inherit;
    }
</style>
