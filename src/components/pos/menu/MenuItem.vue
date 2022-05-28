<template>
  <div class="menu_item" @click="$emit('addItem', item)">
    <p v-html="item.name"></p>
    <p class="item_price" v-html="item.price_display"></p>
  </div>
</template>
<script>
export default {
  name: 'MenuItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
};
</script>
<style lang="scss">
@import '@/styles/constants.scss';

.menu_item {
  min-height: 75px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-bottom: 0.5px solid $bg_color;
  border-right: 0.5px solid $bg_color;
  overflow: hidden;
  cursor: pointer;
  color: $black-text;
  padding: 5px;

  p {
    margin: auto;
    padding-right: 5px;
    padding-left: 5px;
    max-lines: 1;
    line-height: 1.5;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
    white-space: nowrap;
    text-align: left;
    text-transform: uppercase;
  }

  .item_price {
    text-align: left;
    font-weight: bold;
    justify-content: baseline;
    color: $blue-darker;
  }
}

.menu_item:hover {
  font-size: 1rem;
  p {
    margin: auto;
    padding-right: 5px;
    padding-left: 5px;
    font-weight: bold;
    line-height: 1.5;
    width: 100%;
    white-space: pre-wrap;
    text-align: left;
    text-transform: uppercase;
  }

  .item_price {
    font-weight: bold;
  }
}

.category_item:hover {
  background-color: $bg_color;
}
</style>
